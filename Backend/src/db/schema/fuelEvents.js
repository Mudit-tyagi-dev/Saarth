import { pgTable, serial, integer, varchar, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { vehicles } from "./vehicles.js";

export const fuelEvents = pgTable(
  "fuel_events",
  {
    id: serial("id").primaryKey(),
    vehicle_id: integer("vehicle_id")
      .references(() => vehicles.id, { onDelete: "cascade" })
      .notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    fuel_price: numeric("fuel_price", { precision: 12, scale: 2 }).notNull(),
    estimated_volume: numeric("estimated_volume", { precision: 12, scale: 2 }).notNull(),
    odometer: numeric("odometer", { precision: 12, scale: 2 }).notNull(),
    fuel_type: varchar("fuel_type", { length: 50 }),
    payment_method: varchar("payment_method", { length: 50 }), // 'Cash', 'UPI', 'Card'
    station: varchar("station", { length: 255 }),
    occurred_at: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("fuel_events_vehicle_id_idx").on(table.vehicle_id),
    index("fuel_events_occurred_at_idx").on(table.occurred_at),
  ]
);
