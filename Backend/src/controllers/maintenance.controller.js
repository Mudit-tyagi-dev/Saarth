import * as maintenanceService from "../services/maintenance.service.js";

export async function createMaintenance(req, res) {
  try {
    const record = await maintenanceService.createMaintenance(req.user.userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Maintenance record saved successfully",
      data: record,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to save maintenance record",
    });
  }
}

export async function getMaintenanceByVehicle(req, res) {
  try {
    const records = await maintenanceService.getMaintenanceByVehicle(
      req.user.userId,
      req.params.vehicleId
    );
    return res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch maintenance records",
    });
  }
}

export async function updateMaintenance(req, res) {
  try {
    const record = await maintenanceService.updateMaintenance(
      req.user.userId,
      req.params.id,
      req.body
    );
    return res.json({
      success: true,
      message: "Maintenance record updated successfully",
      data: record,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update maintenance record",
    });
  }
}

export async function deleteMaintenance(req, res) {
  try {
    const result = await maintenanceService.deleteMaintenance(req.user.userId, req.params.id);
    return res.json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete maintenance record",
    });
  }
}
