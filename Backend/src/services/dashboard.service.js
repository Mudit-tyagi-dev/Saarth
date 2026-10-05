import { eq, and, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { vehicles } from "../db/schema/vehicles.js";
import { fuelEvents } from "../db/schema/fuelEvents.js";
import { maintenanceRecords } from "../db/schema/maintenance.js";
import {
  enrichFuelEventsWithMetrics,
  generateVehicleInsight,
} from "../utils/calculations.js";

export async function getVehicleDashboardData(userId, vehicleId) {
  const vId = parseInt(vehicleId, 10);
  if (isNaN(vId)) {
    const error = new Error("Invalid vehicle ID");
    error.statusCode = 400;
    throw error;
  }

  // Ensure vehicle exists and belongs to user
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

  // Fetch all fuel events for this vehicle sorted chronologically
  const rawEvents = await db
    .select()
    .from(fuelEvents)
    .where(eq(fuelEvents.vehicle_id, vId))
    .orderBy(asc(fuelEvents.occurred_at), asc(fuelEvents.id));

  const enrichedEvents = enrichFuelEventsWithMetrics(rawEvents);

  // Valid mileage and cost events
  const validMileageEvents = enrichedEvents.filter((e) => e.mileage !== null && e.mileage > 0);
  const validCostEvents = enrichedEvents.filter((e) => e.costPerKm !== null && e.costPerKm > 0);

  const averageMileage =
    validMileageEvents.length > 0
      ? Number(
          (
            validMileageEvents.reduce((sum, e) => sum + Number(e.mileage), 0) /
            validMileageEvents.length
          ).toFixed(1)
        )
      : null;

  const costPerKm =
    validCostEvents.length > 0
      ? Number(
          (
            validCostEvents.reduce((sum, e) => sum + Number(e.costPerKm), 0) /
            validCostEvents.length
          ).toFixed(2)
        )
      : null;

  // Monthly fuel spend (current calendar month)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthEvents = rawEvents.filter((e) => {
    const d = new Date(e.occurred_at);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const monthlyFuelSpend = Number(
    currentMonthEvents.reduce((sum, e) => sum + Number(e.amount), 0).toFixed(2)
  );

  // Previous month fuel spend for trend comparison
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();

  const prevMonthEvents = rawEvents.filter((e) => {
    const d = new Date(e.occurred_at);
    return d.getFullYear() === prevMonthYear && d.getMonth() === prevMonth;
  });

  const prevMonthFuelSpend = Number(
    prevMonthEvents.reduce((sum, e) => sum + Number(e.amount), 0).toFixed(2)
  );

  const totalFuelSpend = Number(
    rawEvents.reduce((sum, e) => sum + Number(e.amount), 0).toFixed(2)
  );

  // Recent fuel events (newest first, limit 5)
  const sortedDesc = [...enrichedEvents].reverse();
  const recentFuelEvents = sortedDesc.slice(0, 5).map((e) => ({
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
    distance: e.distance,
    mileage: e.mileage,
    costPerKm: e.costPerKm,
  }));

  // Mileage trend chart data (last 7 valid data points)
  const recentMileageHistory = validMileageEvents.slice(-7).map((e) => ({
    id: e.id,
    date: new Date(e.occurred_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    mileage: Number(e.mileage),
    odometer: Number(e.odometer),
    costPerKm: e.costPerKm ? Number(e.costPerKm) : null,
  }));

  // Generate rule-based insight
  const insight = generateVehicleInsight(
    enrichedEvents,
    averageMileage,
    monthlyFuelSpend,
    prevMonthFuelSpend
  );

  // Next service and maintenance preview
  const maintenanceList = await db
    .select()
    .from(maintenanceRecords)
    .where(eq(maintenanceRecords.vehicle_id, vId))
    .orderBy(maintenanceRecords.service_date);

  const lastMaintenance = maintenanceList.length > 0 ? maintenanceList[maintenanceList.length - 1] : null;

  return {
    vehicle: {
      id: vehicle.id,
      name: vehicle.name,
      registrationNumber: vehicle.registration_number,
      vehicleNumber: vehicle.registration_number,
      vehicleType: vehicle.vehicle_type,
      fuelType: vehicle.fuel_type,
      model: vehicle.model,
      year: vehicle.year,
      currentOdometer: Number(vehicle.current_odometer || 0),
    },
    metrics: {
      averageMileage,
      costPerKm,
      monthlyFuelSpend,
      prevMonthFuelSpend,
      totalFuelSpend,
      fuelEventCount: rawEvents.length,
      currentOdometer: Number(vehicle.current_odometer || 0),
    },
    // Top-level aliases for direct access
    averageMileage,
    costPerKm,
    monthlyFuelSpend,
    fuelEventCount: rawEvents.length,
    recentFuelEvents,
    recentMileageHistory,
    insight,
    maintenanceSummary: {
      lastServiceDate: lastMaintenance ? lastMaintenance.service_date : null,
      lastServiceOdometer: lastMaintenance ? Number(lastMaintenance.odometer || 0) : null,
      totalRecords: maintenanceList.length,
    },
  };
}
