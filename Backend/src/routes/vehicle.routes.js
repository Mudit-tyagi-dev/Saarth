import { Router } from "express";
import * as vehicleController from "../controllers/vehicle.controller.js";
import * as fuelController from "../controllers/fuel.controller.js";
import * as dashboardController from "../controllers/dashboard.controller.js";
import * as maintenanceController from "../controllers/maintenance.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

// Vehicles CRUD
router.post("/", vehicleController.createVehicle);
router.get("/", vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

// Vehicle nested routes
router.get("/:vehicleId/fuel-events", fuelController.getFuelEventsByVehicle);
router.get("/:vehicleId/dashboard", dashboardController.getDashboardData);
router.get("/:vehicleId/maintenance", maintenanceController.getMaintenanceByVehicle);

export default router;
