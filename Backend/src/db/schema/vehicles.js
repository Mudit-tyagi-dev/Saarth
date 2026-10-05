import { pgTable, serial, integer, varchar, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const vehicles = pgTable(
  "vehicles",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    registration_number: varchar("registration_number", { length: 50 }).notNull(),
    vehicle_type: varchar("vehicle_type", { length: 50 }).notNull(), // 'Car', 'Bike'
    fuel_type: varchar("fuel_type", { length: 50 }).notNull(), // 'Petrol', 'Diesel', 'CNG'
    model: varchar("model", { length: 100 }),
    year: integer("year"),
    current_odometer: numeric("current_odometer", { precision: 12, scale: 2 }).default("0").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("vehicles_user_id_idx").on(table.user_id),
  ]
);
