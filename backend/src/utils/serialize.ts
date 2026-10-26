/** Date-only serialisation keeps the API timezone independent. */
export function toDateOnly(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

type AnyDoc = Record<string, any>;

export function toRequirementDTO(doc: AnyDoc) {
  const logistics = doc.logistics ?? {};
  const category = doc.category as "planner" | "performer" | "crew";

  return {
    id: String(doc._id),
    category,
    basics: {
      eventName: doc.basics.eventName,
      eventType: doc.basics.eventType,
      dateMode: doc.basics.dateMode,
      startDate: toDateOnly(doc.basics.startDate),
      endDate: toDateOnly(doc.basics.endDate),
      city: doc.basics.city,
      state: doc.basics.state ?? null,
      country: doc.basics.country,
      venue: doc.basics.venue ?? null,
    },
    // All three blocks are always present in the response so clients get a
    // stable shape; only the active category is non-null.
    planner: category === "planner" ? (doc.planner ?? null) : null,
    performer: category === "performer" ? (doc.performer ?? null) : null,
    crew: category === "crew" ? (doc.crew ?? null) : null,
    logistics: {
      responseDeadline: toDateOnly(logistics.responseDeadline),
      budgetFlexibility: logistics.budgetFlexibility,
      travelCovered: logistics.travelCovered,
      contactName: logistics.contactName,
      contactEmail: logistics.contactEmail,
      contactPhone: logistics.contactPhone ?? null,
      notes: logistics.notes ?? null,
      plannerContractType: logistics.plannerContractType ?? null,
      performerSoundcheck:
        typeof logistics.performerSoundcheck === "boolean" ? logistics.performerSoundcheck : null,
      crewEquipmentProvided:
        typeof logistics.crewEquipmentProvided === "boolean"
          ? logistics.crewEquipmentProvided
          : null,
    },
    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt,
    updatedAt: doc.updatedAt?.toISOString?.() ?? doc.updatedAt,
  };
}
