import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { fuelEvents } from "../db/schema/fuelEvents.js";
import { vehicles } from "../db/schema/vehicles.js";
import { notifications } from "../db/schema/notifications.js";
import {
  calculateEstimatedFuelVolume,
  enrichFuelEventsWithMetrics,
} from "../utils/calculations.js";

export async function createFuelEvent(userId, data) {
  const {
    vehicleId,
    vehicle_id,
    amount,
    fuelPrice,
    fuel_price,
    odometer,
    fuelType,
    fuel_type,
    paymentMethod,
    payment_method,
    station,
    occurredAt,
    occurred_at,
  } = data;

  const vId = parseInt(vehicleId || vehicle_id, 10);
  if (isNaN(vId)) {
    const error = new Error("Valid Vehicle ID is required");
    error.statusCode = 400;
    throw error;
  }

  // Ensure vehicle belongs to user
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, vId), eq(vehicles.user_id, userId)))
    .limit(1);

  if (!vehicle) {
    const error = new Error("Vehicle not found or does not belong to you");
    error.statusCode = 404;
    throw error;
  }

  const numAmount = Number(amount);
  const numFuelPrice = Number(fuelPrice || fuel_price);
  const numOdometer = Number(odometer);

  if (!numAmount || numAmount <= 0) {
    const error = new Error("Valid fuel amount is required");
    error.statusCode = 400;
    throw error;
  }

  if (!numFuelPrice || numFuelPrice <= 0) {
    const error = new Error("Valid fuel price per litre is required");
    error.statusCode = 400;
    throw error;
  }

  if (numOdometer === undefined || isNaN(numOdometer) || numOdometer < 0) {
    const error = new Error("Valid odometer reading is required");
    error.statusCode = 400;
    throw error;
  }

  // Calculate estimated fuel volume = amount / fuel_price
  const estimatedVolume = calculateEstimatedFuelVolume(numAmount, numFuelPrice);

  const eventDate = occurredAt || occurred_at ? new Date(occurredAt || occurred_at) : new Date();

  // Insert fuel event
  const [created] = await db
    .insert(fuelEvents)
    .values({
      vehicle_id: vId,
      amount: String(numAmount),
      fuel_price: String(numFuelPrice),
      estimated_volume: String(estimatedVolume),
      odometer: String(numOdometer),
      fuel_type: fuelType || fuel_type || vehicle.fuel_type || "Petrol",
      payment_method: paymentMethod || payment_method || "UPI",
      station: station ? String(station).trim() : null,
      occurred_at: eventDate,
      updated_at: new Date(),
    })
    .returning();

  // Update vehicle current odometer if higher
  const currentVehicleOdo = Number(vehicle.current_odometer || 0);
  if (numOdometer > currentVehicleOdo) {
    await db
      .update(vehicles)
      .set({
        current_odometer: String(numOdometer),
        updated_at: new Date(),
      })
      .where(eq(vehicles.id, vId));
  }

  // Fetch all vehicle events to recalculate metrics and generate notifications if needed
  const allEvents = await db
    .select()
    .from(fuelEvents)
    .where(eq(fuelEvents.vehicle_id, vId))
    .orderBy(asc(fuelEvents.occurred_at), asc(fuelEvents.id));

  const enriched = enrichFuelEventsWithMetrics(allEvents);
  const currentEnriched = enriched.find((e) => e.id === created.id) || created;

  // Rule-based notification creation: check if mileage drops by >10%
  const validMileageList = enriched.filter((e) => e.mileage !== null && e.mileage > 0);
  if (validMileageList.length >= 3 && currentEnriched.mileage) {
    const priorList = validMileageList.filter((e) => e.id !== created.id);
    if (priorList.length > 0) {
      const priorAvg =
        priorList.reduce((s, e) => s + Number(e.mileage), 0) / priorList.length;
      if (currentEnriched.mileage < priorAvg * 0.88) {
        // Create an alert notification
        try {
          await db.insert(notifications).values({
            user_id: userId,
            vehicle_id: vId,
            type: "mileage",
            title: "Mileage Alert",
            message: `Your latest refill returned ${currentEnriched.mileage} km/L, which is significantly below your average (${priorAvg.toFixed(1)} km/L).`,
            is_read: false,
          });
        } catch (err) {
          console.error("Failed to create mileage notification:", err);
        }
      }
    }
  }

  return formatFuelEventResponse(currentEnriched);
}

export async function getFuelEventsByVehicle(userId, vehicleId) {
  const vId = parseInt(vehicleId, 10);
  if (isNaN(vId)) {
    const error = new Error("Invalid vehicle ID");
    error.statusCode = 400;
    throw error;
  }

  // Verify ownership
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, vId), eq(vehicles.user_id, userId)))
    .limit(1);

  if (!vehicle) {
    const error = new Error("Vehicle not found");
    error.statusCode = 404;
    throw error;
  }

  const rawEvents = await db
    .select()
    .from(fuelEvents)
    .where(eq(fuelEvents.vehicle_id, vId))
    .orderBy(asc(fuelEvents.occurred_at), asc(fuelEvents.id));

  const enriched = enrichFuelEventsWithMetrics(rawEvents);

  // Return sorted descending (newest first)
  return enriched.reverse().map(formatFuelEventResponse);
}

export async function getFuelEventById(userId, fuelEventId) {
  const fId = parseInt(fuelEventId, 10);
  if (isNaN(fId)) {
    const error = new Error("Invalid fuel event ID");
    error.statusCode = 400;
    throw error;
  }

  const [event] = await db
    .select({
      event: fuelEvents,
      vehicle: vehicles,
    })
    .from(fuelEvents)
    .innerJoin(vehicles, eq(fuelEvents.vehicle_id, vehicles.id))
    .where(and(eq(fuelEvents.id, fId), eq(vehicles.user_id, userId)))
    .limit(1);

  if (!event) {
    const error = new Error("Fuel event not found");
    error.statusCode = 404;
    throw error;
  }

  // Calculate metrics in vehicle stream
  const allEvents = await db
    .select()
    .from(fuelEvents)
    .where(eq(fuelEvents.vehicle_id, event.event.vehicle_id))
    .orderBy(asc(fuelEvents.occurred_at), asc(fuelEvents.id));

  const enriched = enrichFuelEventsWithMetrics(allEvents);
  const found = enriched.find((e) => e.id === fId) || event.event;

  return formatFuelEventResponse(found);
}

export async function updateFuelEvent(userId, fuelEventId, data) {
  const fId = parseInt(fuelEventId, 10);
  if (isNaN(fId)) {
    const error = new Error("Invalid fuel event ID");
    error.statusCode = 400;
    throw error;
  }

  const [existing] = await db
    .select({
      event: fuelEvents,
      vehicle: vehicles,
    })
    .from(fuelEvents)
    .innerJoin(vehicles, eq(fuelEvents.vehicle_id, vehicles.id))
    .where(and(eq(fuelEvents.id, fId), eq(vehicles.user_id, userId)))
    .limit(1);

  if (!existing) {
    const error = new Error("Fuel event not found");
    error.statusCode = 404;
    throw error;
  }

  const updateFields = {
    updated_at: new Date(),
  };

  const amount = data.amount !== undefined ? Number(data.amount) : Number(existing.event.amount);
  const price =
    data.fuelPrice !== undefined || data.fuel_price !== undefined
      ? Number(data.fuelPrice || data.fuel_price)
      : Number(existing.event.fuel_price);

  if (data.amount !== undefined) updateFields.amount = String(amount);
  if (data.fuelPrice !== undefined || data.fuel_price !== undefined) {
    updateFields.fuel_price = String(price);
  }

  if (data.amount !== undefined || data.fuelPrice !== undefined || data.fuel_price !== undefined) {
    updateFields.estimated_volume = String(calculateEstimatedFuelVolume(amount, price));
  }

  if (data.odometer !== undefined) updateFields.odometer = String(data.odometer);
  if (data.fuelType !== undefined || data.fuel_type !== undefined) {
    updateFields.fuel_type = data.fuelType || data.fuel_type;
  }
  if (data.paymentMethod !== undefined || data.payment_method !== undefined) {
    updateFields.payment_method = data.paymentMethod || data.payment_method;
  }
  if (data.station !== undefined) updateFields.station = data.station ? String(data.station).trim() : null;
  if (data.occurredAt !== undefined || data.occurred_at !== undefined) {
    updateFields.occurred_at = new Date(data.occurredAt || data.occurred_at);
  }

  const [updated] = await db
    .update(fuelEvents)
    .set(updateFields)
    .where(eq(fuelEvents.id, fId))
    .returning();

  // Re-enrich
  const allEvents = await db
    .select()
    .from(fuelEvents)
    .where(eq(fuelEvents.vehicle_id, existing.event.vehicle_id))
    .orderBy(asc(fuelEvents.occurred_at), asc(fuelEvents.id));

  const enriched = enrichFuelEventsWithMetrics(allEvents);
  const found = enriched.find((e) => e.id === fId) || updated;

  return formatFuelEventResponse(found);
}

export async function deleteFuelEvent(userId, fuelEventId) {
  const fId = parseInt(fuelEventId, 10);
  if (isNaN(fId)) {
    const error = new Error("Invalid fuel event ID");
    error.statusCode = 400;
    throw error;
  }

  const [existing] = await db
    .select({
      event: fuelEvents,
      vehicle: vehicles,
    })
    .from(fuelEvents)
    .innerJoin(vehicles, eq(fuelEvents.vehicle_id, vehicles.id))
    .where(and(eq(fuelEvents.id, fId), eq(vehicles.user_id, userId)))
    .limit(1);

  if (!existing) {
    const error = new Error("Fuel event not found");
    error.statusCode = 404;
    throw error;
  }

  await db.delete(fuelEvents).where(eq(fuelEvents.id, fId));

  return { success: true, message: "Fuel event deleted successfully" };
}

function formatFuelEventResponse(e) {
  return {
    id: e.id,
    vehicleId: e.vehicle_id,
    amount: Number(e.amount),
    fuelPrice: Number(e.fuel_price),
    estimatedVolume: Number(e.estimated_volume),
    odometer: Number(e.odometer),
    fuelType: e.fuel_type,
    paymentMethod: e.payment_method,
    station: e.station,
    occurredAt: e.occurred_at,
    createdAt: e.created_at,
    distance: e.distance !== undefined ? e.distance : null,
    mileage: e.mileage !== undefined ? e.mileage : null,
    costPerKm: e.cost_per_km !== undefined ? e.cost_per_km : e.costPerKm !== undefined ? e.costPerKm : null,
  };
}
