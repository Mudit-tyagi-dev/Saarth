import * as notificationService from "../services/notification.service.js";

export async function getNotifications(req, res) {
  try {
    const list = await notificationService.getUserNotifications(req.user.userId);
    return res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
}

export async function markAsRead(req, res) {
  try {
    const result = await notificationService.markNotificationRead(
      req.user.userId,
      req.params.id
    );
    return res.json({
      success: true,
      message: "Notification marked as read",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update notification",
    });
  }
}
