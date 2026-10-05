import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { maintenanceRecords } from "../db/schema/maintenance.js";
import { vehicles } from "../db/schema/vehicles.js";

export async function createMaintenance(userId, data) {
  const {
    vehicleId,
    vehicle_id,
    serviceType,
    service_type,
    serviceDate,
    service_date,
    odometer,
    cost,
    notes,
  } = data;

  const vId = parseInt(vehicleId || vehicle_id, 10);
  if (isNaN(vId)) {
    const error = new Error("Valid Vehicle ID is required");
    error.statusCode = 400;
    throw error;
  }

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

  const sType = (serviceType || service_type || "").trim();
  if (!sType) {
    const error = new Error("Service type is required");
    error.statusCode = 400;
    throw error;
  }

  const sDate = serviceDate || service_date ? new Date(serviceDate || service_date) : new Date();
  const numOdo = odometer !== undefined && odometer !== null && odometer !== "" ? String(odometer) : null;
  const numCost = cost !== undefined && cost !== null && cost !== "" ? String(cost) : "0";

  const [created] = await db
    .insert(maintenanceRecords)
    .values({
      vehicle_id: vId,
      service_type: sType,
      service_date: sDate,
      odometer: numOdo,
      cost: numCost,
      notes: notes ? String(notes).trim() : null,
      updated_at: new Date(),
    })
    .returning();

  // If odometer is higher, update vehicle current odometer
  if (numOdo && Number(numOdo) > Number(vehicle.current_odometer || 0)) {
    await db
      .update(vehicles)
      .set({
        current_odometer: numOdo,
        updated_at: new Date(),
      })
      .where(eq(vehicles.id, vId));
  }

  return formatMaintenanceResponse(created);
}

export async function getMaintenanceByVehicle(userId, vehicleId) {
  const vId = parseInt(vehicleId, 10);
  if (isNaN(vId)) {
    const error = new Error("Invalid vehicle ID");
    error.statusCode = 400;
    throw error;
  }

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

  const records = await db
    .select()
    .from(maintenanceRecords)
    .where(eq(maintenanceRecords.vehicle_id, vId))
    .orderBy(desc(maintenanceRecords.service_date));

  return records.map(formatMaintenanceResponse);
}

export async function updateMaintenance(userId, maintenanceId, data) {
  const mId = parseInt(maintenanceId, 10);
  if (isNaN(mId)) {
    const error = new Error("Invalid maintenance record ID");
    error.statusCode = 400;
    throw error;
  }

  const [existing] = await db
    .select({
      record: maintenanceRecords,
      vehicle: vehicles,
    })
    .from(maintenanceRecords)
    .innerJoin(vehicles, eq(maintenanceRecords.vehicle_id, vehicles.id))
    .where(and(eq(maintenanceRecords.id, mId), eq(vehicles.user_id, userId)))
    .limit(1);

  if (!existing) {
    const error = new Error("Maintenance record not found");
    error.statusCode = 404;
    throw error;
  }

  const updateFields = {
    updated_at: new Date(),
  };

  if (data.serviceType !== undefined || data.service_type !== undefined) {
    updateFields.service_type = (data.serviceType || data.service_type).trim();
  }
  if (data.serviceDate !== undefined || data.service_date !== undefined) {
    updateFields.service_date = new Date(data.serviceDate || data.service_date);
  }
  if (data.odometer !== undefined) updateFields.odometer = String(data.odometer);
  if (data.cost !== undefined) updateFields.cost = String(data.cost);
  if (data.notes !== undefined) updateFields.notes = data.notes ? String(data.notes).trim() : null;

  const [updated] = await db
    .update(maintenanceRecords)
    .set(updateFields)
    .where(eq(maintenanceRecords.id, mId))
    .returning();

  return formatMaintenanceResponse(updated);
}

export async function deleteMaintenance(userId, maintenanceId) {
  const mId = parseInt(maintenanceId, 10);
  if (isNaN(mId)) {
    const error = new Error("Invalid maintenance record ID");
    error.statusCode = 400;
    throw error;
  }

  const [existing] = await db
    .select({
      record: maintenanceRecords,
      vehicle: vehicles,
    })
    .from(maintenanceRecords)
    .innerJoin(vehicles, eq(maintenanceRecords.vehicle_id, vehicles.id))
    .where(and(eq(maintenanceRecords.id, mId), eq(vehicles.user_id, userId)))
    .limit(1);

  if (!existing) {
    const error = new Error("Maintenance record not found");
    error.statusCode = 404;
    throw error;
  }

  await db.delete(maintenanceRecords).where(eq(maintenanceRecords.id, mId));

  return { success: true, message: "Maintenance record deleted successfully" };
}

function formatMaintenanceResponse(r) {
  return {
    id: r.id,
    vehicleId: r.vehicle_id,
    serviceType: r.service_type,
    serviceDate: r.service_date,
    odometer: r.odometer ? Number(r.odometer) : null,
    cost: Number(r.cost || 0),
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
