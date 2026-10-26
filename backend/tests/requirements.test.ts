import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app";

let mongo: MongoMemoryServer;

const app = createApp();

function daysFromNow(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const plannerPayload = () => ({
  category: "planner",
  basics: {
    eventName: "Sharma Wedding Reception",
    eventType: "Wedding",
    dateMode: "range",
    startDate: daysFromNow(30),
    endDate: daysFromNow(31),
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    venue: "Rambagh Palace",
  },
  planner: {
    guestCount: 200,
    budgetMin: 300000,
    budgetMax: 500000,
    services: ["Venue sourcing", "Vendor management"],
    experienceLevel: "Expert",
  },
  logistics: {
    responseDeadline: daysFromNow(7),
    budgetFlexibility: "Negotiable",
    travelCovered: true,
    contactName: "Rohit Sharma",
    contactEmail: "rohit@example.com",
    contactPhone: "+91 90000 00000",
    notes: "Prefer vendors with palace experience.",
    plannerContractType: "One-time",
  },
});

const crewPayload = () => ({
  category: "crew",
  basics: {
    eventName: "Indie Night Live",
    eventType: "Concert / Live Show",
    dateMode: "single",
    startDate: daysFromNow(20),
    city: "Delhi",
    state: "Delhi",
    country: "India",
  },
  crew: {
    role: "Lighting Technician",
    headcount: 2,
    shiftHours: 8,
    skillLevel: "Intermediate",
    dailyRate: 7000,
    ownGear: false,
  },
  logistics: {
    responseDeadline: daysFromNow(5),
    budgetFlexibility: "Fixed",
    travelCovered: false,
    contactName: "Neha Kapoor",
    contactEmail: "neha@example.com",
    notes: "",
    crewEquipmentProvided: true,
  },
});

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri("gopratle_test"));
});

afterEach(async () => {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("GET /health", () => {
  it("returns an ok status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("ok");
  });
});

describe("POST /api/requirements", () => {
  it("creates a planner requirement and stores only the planner block", async () => {
    const response = await request(app).post("/api/requirements").send(plannerPayload());

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.category).toBe("planner");
    expect(response.body.data.planner.guestCount).toBe(200);
    expect(response.body.data.performer).toBeNull();
    expect(response.body.data.crew).toBeNull();
    expect(response.body.data.basics.endDate).toBe(daysFromNow(31));
    expect(response.body.data.id).toMatch(/^[a-f0-9]{24}$/);

    const stored = await mongoose.connection.db!.collection("requirements").findOne({});
    expect(stored?.category).toBe("planner");
    expect(stored?.planner).toBeTruthy();
    expect(stored?.performer).toBeUndefined();
    expect(stored?.basics.startDate).toBeInstanceOf(Date);
  });

  it("rejects a payload that mixes category blocks", async () => {
    const payload = { ...crewPayload(), planner: plannerPayload().planner };

    const response = await request(app).post("/api/requirements").send(payload);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "planner" }),
      ]),
    );
  });

  it("rejects an end date before the start date", async () => {
    const payload = plannerPayload();
    payload.basics.endDate = daysFromNow(10);

    const response = await request(app).post("/api/requirements").send(payload);

    expect(response.status).toBe(422);
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "basics.endDate",
          message: "End date cannot be before the start date",
        }),
      ]),
    );
  });

  it("accepts an empty end date for a single-day event", async () => {
    const response = await request(app)
      .post("/api/requirements")
      .send({ ...crewPayload(), basics: { ...crewPayload().basics, endDate: "" } });

    expect(response.status).toBe(201);
    expect(response.body.data.basics.endDate).toBeNull();
  });

  it("rejects a malformed end date", async () => {
    const response = await request(app)
      .post("/api/requirements")
      .send({ ...crewPayload(), basics: { ...crewPayload().basics, endDate: "31-12-2026" } });

    expect(response.status).toBe(422);
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "basics.endDate" })]),
    );
  });

  it("rejects an unknown category", async () => {
    const payload = { ...crewPayload(), category: "vendor" };

    const response = await request(app).post("/api/requirements").send(payload);

    expect(response.status).toBe(422);
    expect(response.body.error.details[0].path).toBe("category");
  });

  it("rejects missing contact details", async () => {
    const payload = crewPayload();
    // @ts-expect-error deliberately removing a required field
    delete payload.logistics.contactEmail;

    const response = await request(app).post("/api/requirements").send(payload);

    expect(response.status).toBe(422);
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "logistics.contactEmail" })]),
    );
  });
});

describe("GET /api/requirements", () => {
  it("filters by category and returns pagination meta", async () => {
    await request(app).post("/api/requirements").send(plannerPayload());
    await request(app).post("/api/requirements").send(crewPayload());

    const response = await request(app).get("/api/requirements").query({ category: "crew" });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].category).toBe("crew");
    expect(response.body.meta.total).toBe(1);
  });

  it("rejects an invalid category filter", async () => {
    const response = await request(app).get("/api/requirements").query({ category: "nope" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("BAD_REQUEST");
  });
});

describe("GET /api/requirements/stats", () => {
  it("counts requirements per category", async () => {
    await request(app).post("/api/requirements").send(plannerPayload());
    await request(app).post("/api/requirements").send(crewPayload());
    await request(app).post("/api/requirements").send(crewPayload());

    const response = await request(app).get("/api/requirements/stats");

    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(3);
    expect(response.body.data.byCategory).toEqual({ planner: 1, performer: 0, crew: 2 });
  });
});

describe("GET /api/requirements/:id", () => {
  it("returns 400 for a malformed id and 404 for a missing one", async () => {
    const malformed = await request(app).get("/api/requirements/not-an-id");
    expect(malformed.status).toBe(400);

    const missing = await request(app).get(`/api/requirements/${new mongoose.Types.ObjectId()}`);
    expect(missing.status).toBe(404);
  });
});
