import { pgTable, serial, integer, varchar, numeric, text, timestamp, index } from "drizzle-orm/pg-core";
import { vehicles } from "./vehicles.js";

export const maintenanceRecords = pgTable(
  "maintenance_records",
  {
    id: serial("id").primaryKey(),
    vehicle_id: integer("vehicle_id")
      .references(() => vehicles.id, { onDelete: "cascade" })
      .notNull(),
    service_type: varchar("service_type", { length: 255 }).notNull(),
    service_date: timestamp("service_date", { withTimezone: true }).defaultNow().notNull(),
    odometer: numeric("odometer", { precision: 12, scale: 2 }),
    cost: numeric("cost", { precision: 12, scale: 2 }).default("0").notNull(),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("maintenance_records_vehicle_id_idx").on(table.vehicle_id),
  ]
);
