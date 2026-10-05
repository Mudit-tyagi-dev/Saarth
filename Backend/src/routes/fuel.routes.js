import { Router } from "express";
import * as fuelController from "../controllers/fuel.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", fuelController.createFuelEvent);
router.get("/:id", fuelController.getFuelEventById);
router.put("/:id", fuelController.updateFuelEvent);
router.delete("/:id", fuelController.deleteFuelEvent);

export default router;
