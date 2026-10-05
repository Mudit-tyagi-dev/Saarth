import { pgTable, serial, integer, varchar, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { vehicles } from "./vehicles.js";

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    vehicle_id: integer("vehicle_id")
      .references(() => vehicles.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), // 'mileage', 'maintenance', 'monthly', 'info'
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    is_read: boolean("is_read").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.user_id),
  ]
);
