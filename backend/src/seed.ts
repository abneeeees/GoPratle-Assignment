import { connectDatabase, disconnectDatabase } from "./config/db";
import { env } from "./config/env";
import { Requirement } from "./models/Requirement";

const inDays = (days: number) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

const common = {
  eventType: "Wedding",
  dateMode: "single",
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  logistics: {
    budgetFlexibility: "Somewhat flexible",
    travelCovered: true,
    contactName: "Aarav Mehta",
    contactEmail: "aarav@example.com",
    contactPhone: "+91 98765 43210",
  },
};

async function seed() {
  await connectDatabase();

  await Requirement.deleteMany({});

  const documents = [
    {
      ...common,
      category: "planner",
      basics: {
        eventName: "Mehta–Rao Wedding",
        eventType: "Wedding",
        dateMode: "range",
        startDate: inDays(45),
        endDate: inDays(47),
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        venue: "The Leela Palace",
      },
      planner: {
        guestCount: 350,
        budgetMin: 800000,
        budgetMax: 1200000,
        services: ["Venue sourcing", "Vendor management", "On-site coordination"],
        experienceLevel: "Expert",
      },
      logistics: {
        ...common.logistics,
        responseDeadline: inDays(10),
        notes: "Two-day function with a mehendi on day one. Need a single point of contact.",
        plannerContractType: "One-time",
      },
    },
    {
      ...common,
      category: "performer",
      basics: {
        eventName: "Nexus Tech Summit Afterparty",
        eventType: "Corporate Event",
        dateMode: "single",
        startDate: inDays(30),
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        venue: "HITEC Convention Centre",
      },
      performer: {
        performerType: "Live Band",
        genre: "Indie rock / pop covers",
        setDurationMinutes: 90,
        feeExpectation: 150000,
        ownEquipment: true,
        portfolioUrl: "https://example.com/bands/neon-avenue",
      },
      logistics: {
        ...common.logistics,
        contactName: "Priya Nair",
        contactEmail: "priya@example.com",
        responseDeadline: inDays(7),
        notes: "Stage and green room provided. Soundcheck at 4pm.",
        performerSoundcheck: true,
      },
    },
    {
      ...common,
      category: "crew",
      basics: {
        eventName: "Sunburn Campus Fest",
        eventType: "Festival",
        dateMode: "range",
        startDate: inDays(60),
        endDate: inDays(62),
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        venue: null,
      },
      crew: {
        role: "Sound Engineer",
        headcount: 3,
        shiftHours: 10,
        skillLevel: "Expert",
        dailyRate: 9000,
        ownGear: true,
      },
      logistics: {
        ...common.logistics,
        responseDeadline: inDays(14),
        notes: "Outdoor stage, three days. Accommodation and meals covered.",
        crewEquipmentProvided: false,
      },
    },
    {
      ...common,
      category: "planner",
      basics: {
        eventName: "Verma Anniversary Dinner",
        eventType: "Private Party",
        dateMode: "single",
        startDate: inDays(21),
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        venue: "Private residence, Bandra",
      },
      planner: {
        guestCount: 60,
        budgetMin: 120000,
        budgetMax: 175000,
        services: ["Design & decor", "Guest management"],
        experienceLevel: "Intermediate",
      },
      logistics: {
        ...common.logistics,
        responseDeadline: inDays(5),
        plannerContractType: "One-time",
      },
    },
    {
      ...common,
      category: "performer",
      basics: {
        eventName: "Rooftop Sundowner Sessions",
        eventType: "Concert / Live Show",
        dateMode: "single",
        startDate: inDays(18),
        city: "Goa",
        state: "Goa",
        country: "India",
        venue: "Sky Lounge, Panjim",
      },
      performer: {
        performerType: "DJ",
        genre: "Deep house",
        setDurationMinutes: 120,
        feeExpectation: 60000,
        ownEquipment: false,
      },
      logistics: {
        ...common.logistics,
        contactEmail: "events@example.com",
        responseDeadline: inDays(4),
        performerSoundcheck: false,
      },
    },
    {
      ...common,
      category: "crew",
      basics: {
        eventName: "Product Launch — Studio Shoot",
        eventType: "Corporate Event",
        dateMode: "single",
        startDate: inDays(12),
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        venue: "Whitefield Studio 4",
      },
      crew: {
        role: "Photographer",
        headcount: 1,
        shiftHours: 6,
        skillLevel: "Intermediate",
        dailyRate: 12000,
        ownGear: true,
      },
      logistics: {
        ...common.logistics,
        responseDeadline: inDays(3),
        crewEquipmentProvided: true,
      },
    },
  ];

  const created = await Requirement.create(documents);

  console.log(`[seed] inserted ${created.length} requirements into ${env.MONGODB_URI}`);
  console.log(
    `[seed] by category:`,
    created.reduce<Record<string, number>>((acc, doc) => {
      acc[doc.category] = (acc[doc.category] ?? 0) + 1;
      return acc;
    }, {}),
  );

  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error("[seed] failed:", error);
  await disconnectDatabase();
  process.exit(1);
});
