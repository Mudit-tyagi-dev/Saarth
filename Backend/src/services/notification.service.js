import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications } from "../db/schema/notifications.js";

export async function getUserNotifications(userId) {
  const list = await db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.created_at));

  return list.map((n) => ({
    id: n.id,
    userId: n.user_id,
    vehicleId: n.vehicle_id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.is_read,
    createdAt: n.created_at,
  }));
}

export async function markNotificationRead(userId, notificationId) {
  const nId = parseInt(notificationId, 10);
  if (isNaN(nId)) {
    const error = new Error("Invalid notification ID");
    error.statusCode = 400;
    throw error;
  }

  const [updated] = await db
    .update(notifications)
    .set({ is_read: true })
    .where(and(eq(notifications.id, nId), eq(notifications.user_id, userId)))
    .returning();

  if (!updated) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: updated.id,
    userId: updated.user_id,
    vehicleId: updated.vehicle_id,
    type: updated.type,
    title: updated.title,
    message: updated.message,
    isRead: updated.is_read,
    createdAt: updated.created_at,
  };
}

export async function createNotification(userId, data) {
  const [created] = await db
    .insert(notifications)
    .values({
      user_id: userId,
      vehicle_id: data.vehicleId || data.vehicle_id || null,
      type: data.type || "info",
      title: data.title,
      message: data.message,
      is_read: false,
    })
    .returning();

  return {
    id: created.id,
    userId: created.user_id,
    vehicleId: created.vehicle_id,
    type: created.type,
    title: created.title,
    message: created.message,
    isRead: created.is_read,
    createdAt: created.created_at,
  };
}
