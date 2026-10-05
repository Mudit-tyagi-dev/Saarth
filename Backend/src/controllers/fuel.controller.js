import * as fuelService from "../services/fuel.service.js";

export async function createFuelEvent(req, res) {
  try {
    const event = await fuelService.createFuelEvent(req.user.userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Fuel event saved successfully",
      data: event,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to record fuel event",
    });
  }
}

export async function getFuelEventsByVehicle(req, res) {
  try {
    const events = await fuelService.getFuelEventsByVehicle(req.user.userId, req.params.vehicleId);
    return res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch fuel events",
    });
  }
}

export async function getFuelEventById(req, res) {
  try {
    const event = await fuelService.getFuelEventById(req.user.userId, req.params.id);
    return res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch fuel event",
    });
  }
}

export async function updateFuelEvent(req, res) {
  try {
    const event = await fuelService.updateFuelEvent(req.user.userId, req.params.id, req.body);
    return res.json({
      success: true,
      message: "Fuel event updated successfully",
      data: event,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update fuel event",
    });
  }
}

export async function deleteFuelEvent(req, res) {
  try {
    const result = await fuelService.deleteFuelEvent(req.user.userId, req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete fuel event",
    });
  }
}
