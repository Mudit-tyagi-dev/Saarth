import * as vehicleService from "../services/vehicle.service.js";

export async function createVehicle(req, res) {
  try {
    const vehicle = await vehicleService.createVehicle(req.user.userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create vehicle",
    });
  }
}

export async function getVehicles(req, res) {
  try {
    const vehicles = await vehicleService.getUserVehicles(req.user.userId);
    return res.json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch vehicles",
    });
  }
}

export async function getVehicleById(req, res) {
  try {
    const vehicle = await vehicleService.getVehicleById(req.user.userId, req.params.id);
    return res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch vehicle details",
    });
  }
}

export async function updateVehicle(req, res) {
  try {
    const vehicle = await vehicleService.updateVehicle(req.user.userId, req.params.id, req.body);
    return res.json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update vehicle",
    });
  }
}

export async function deleteVehicle(req, res) {
  try {
    const result = await vehicleService.deleteVehicle(req.user.userId, req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete vehicle",
    });
  }
}
