import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/:vehicleId", dashboardController.getDashboardData);

export default router;
