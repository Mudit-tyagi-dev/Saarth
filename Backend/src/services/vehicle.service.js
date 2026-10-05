import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { vehicles } from "../db/schema/vehicles.js";
import { fuelEvents } from "../db/schema/fuelEvents.js";
import { maintenanceRecords } from "../db/schema/maintenance.js";
import { enrichFuelEventsWithMetrics } from "../utils/calculations.js";

export async function createVehicle(userId, data) {
  const {
    name,
    registrationNumber,
    registration_number,
    vehicleType,
    vehicle_type,
    fuelType,
    fuel_type,
    model,
    year,
    currentOdometer,
    current_odometer,
  } = data;

  const regNo = (registrationNumber || registration_number || "").trim().toUpperCase();
  const vName = (name || "").trim();
  const vType = vehicleType || vehicle_type || "Car";
  const fType = fuelType || fuel_type || "Petrol";
  const vOdo = currentOdometer !== undefined && currentOdometer !== null ? String(currentOdometer) : "0";

  if (!vName || !regNo) {
    const error = new Error("Vehicle name and registration number are required");
    error.statusCode = 400;
    throw error;
  }

  const [created] = await db
    .insert(vehicles)
    .values({
      user_id: userId,
      name: vName,
      registration_number: regNo,
      vehicle_type: vType,
      fuel_type: fType,
      model: model ? String(model).trim() : null,
      year: year ? parseInt(year, 10) : null,
      current_odometer: vOdo,
      updated_at: new Date(),
    })
    .returning();

  return formatVehicleResponse(created);
}

export async function getUserVehicles(userId) {
  const list = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.user_id, userId))
    .orderBy(desc(vehicles.created_at));

  return list.map(formatVehicleResponse);
}

export async function getVehicleById(userId, vehicleId) {
  const parsedId = parseInt(vehicleId, 10);
  if (isNaN(parsedId)) {
    const error = new Error("Invalid vehicle ID");
    error.statusCode = 400;
    throw error;
  }

  const [found] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, parsedId), eq(vehicles.user_id, userId)))
    .limit(1);

  if (!found) {
    const error = new Error("Vehicle not found");
    error.statusCode = 404;
    throw error;
  }

  // Get fuel events to calculate summary metrics for vehicle overview
  const rawEvents = await db
    .select()
    .from(fuelEvents)
    .where(eq(fuelEvents.vehicle_id, parsedId))
    .orderBy(fuelEvents.occurred_at, fuelEvents.id);

  const enrichedEvents = enrichFuelEventsWithMetrics(rawEvents);
  const validMileageEvents = enrichedEvents.filter((e) => e.mileage !== null && e.mileage > 0);

  const avgMileage =
    validMileageEvents.length > 0
      ? Number(
          (
            validMileageEvents.reduce((s, e) => s + Number(e.mileage), 0) /
            validMileageEvents.length
          ).toFixed(2)
        )
      : null;

  const validCostEvents = enrichedEvents.filter((e) => e.costPerKm !== null && e.costPerKm > 0);
  const avgCostPerKm =
    validCostEvents.length > 0
      ? Number(
          (
            validCostEvents.reduce((s, e) => s + Number(e.costPerKm), 0) /
            validCostEvents.length
          ).toFixed(2)
        )
      : null;

  const totalFuelSpend = Number(
    rawEvents.reduce((s, e) => s + Number(e.amount || 0), 0).toFixed(2)
  );

  const totalFuelVolume = Number(
    rawEvents.reduce((s, e) => s + Number(e.estimated_volume || 0), 0).toFixed(2)
  );

  return {
    ...formatVehicleResponse(found),
    averageMileage: avgMileage,
    avgCostPerKm: avgCostPerKm,
    totalFuelSpend,
    totalFuelVolume,
    fuelEventsCount: rawEvents.length,
  };
}

export async function updateVehicle(userId, vehicleId, data) {
  const parsedId = parseInt(vehicleId, 10);
  if (isNaN(parsedId)) {
    const error = new Error("Invalid vehicle ID");
    error.statusCode = 400;
    throw error;
  }

  const [existing] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, parsedId), eq(vehicles.user_id, userId)))
    .limit(1);

  if (!existing) {
    const error = new Error("Vehicle not found");
    error.statusCode = 404;
    throw error;
  }

  const updateFields = {
    updated_at: new Date(),
  };

  if (data.name !== undefined) updateFields.name = data.name.trim();
  if (data.registrationNumber !== undefined || data.registration_number !== undefined) {
    updateFields.registration_number = (data.registrationNumber || data.registration_number).trim().toUpperCase();
  }
  if (data.vehicleType !== undefined || data.vehicle_type !== undefined) {
    updateFields.vehicle_type = data.vehicleType || data.vehicle_type;
  }
  if (data.fuelType !== undefined || data.fuel_type !== undefined) {
    updateFields.fuel_type = data.fuelType || data.fuel_type;
  }
  if (data.model !== undefined) updateFields.model = data.model ? String(data.model).trim() : null;
  if (data.year !== undefined) updateFields.year = data.year ? parseInt(data.year, 10) : null;
  if (data.currentOdometer !== undefined || data.current_odometer !== undefined) {
    updateFields.current_odometer = String(data.currentOdometer || data.current_odometer);
  }

  const [updated] = await db
    .update(vehicles)
    .set(updateFields)
    .where(and(eq(vehicles.id, parsedId), eq(vehicles.user_id, userId)))
    .returning();

  return formatVehicleResponse(updated);
}

export async function deleteVehicle(userId, vehicleId) {
  const parsedId = parseInt(vehicleId, 10);
  if (isNaN(parsedId)) {
    const error = new Error("Invalid vehicle ID");
    error.statusCode = 400;
    throw error;
  }

  const [deleted] = await db
    .delete(vehicles)
    .where(and(eq(vehicles.id, parsedId), eq(vehicles.user_id, userId)))
    .returning();

  if (!deleted) {
    const error = new Error("Vehicle not found");
    error.statusCode = 404;
    throw error;
  }

  return { success: true, message: "Vehicle deleted successfully" };
}

function formatVehicleResponse(v) {
  return {
    id: v.id,
    userId: v.user_id,
    name: v.name,
    registrationNumber: v.registration_number,
    vehicleNumber: v.registration_number, // Alias for frontend compatibility
    vehicleType: v.vehicle_type,
    type: v.vehicle_type, // Alias
    fuelType: v.fuel_type,
    model: v.model,
    year: v.year,
    currentOdometer: Number(v.current_odometer || 0),
    odometer: Number(v.current_odometer || 0), // Alias
    createdAt: v.created_at,
    updatedAt: v.updated_at,
  };
}
