// Path: web-app/src/db/schema.ts
import { pgTable, serial, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";

// 👨‍⚕️ Doctors Table
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 255 }).notNull(),
  availability: text("availability"), // E.g., "Mon-Fri 10AM-5PM"
});

// 📅 Appointments Table (The Core of our AI Workflow)
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientName: varchar("patient_name", { length: 255 }).notNull(),
  patientPhone: varchar("patient_phone", { length: 20 }).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: varchar("status", { length: 50 }).default("booked"), // booked, cancelled, completed
  notes: text("notes"), // E.g., "Patient called AI bot for migraine"
});

// 🚀 Leads Table (For LeadForge CRM)
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  companyName: varchar("company_name", { length: 150 }),
  companySize: varchar("company_size", { length: 50 }),
  budget: varchar("budget", { length: 50 }),
  timeline: varchar("timeline", { length: 50 }),
  painPoint: text("pain_point"),
  source: varchar("source", { length: 50 }).default("Website Form"),
  aiScore: integer("ai_score").default(0),
  leadStatus: varchar("lead_status", { length: 50 }).default("New"), // New, Hot, Warm, Cold
  aiReasoning: text("ai_reasoning"),
  createdAt: timestamp("created_at").defaultNow(),
});