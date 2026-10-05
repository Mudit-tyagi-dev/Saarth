import * as dashboardService from "../services/dashboard.service.js";

export async function getDashboardData(req, res) {
  try {
    const data = await dashboardService.getVehicleDashboardData(
      req.user.userId,
      req.params.vehicleId
    );
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load dashboard data",
    });
  }
}
