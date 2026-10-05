import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", notificationController.getNotifications);
router.patch("/:id/read", notificationController.markAsRead);

export default router;
