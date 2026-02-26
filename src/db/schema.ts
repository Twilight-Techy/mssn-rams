import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    role: text("role", { enum: ["super_admin", "admin", "coordinator", "user"] }).notNull().default("user"),
    category: text("category", { enum: ["student", "others"] }),
    isMuslim: boolean("is_muslim"),
    matricNumber: text("matric_number"),
    level: text("level"),
    gender: text("gender", { enum: ["brother", "sister"] }),
    department: text("department", {
        enum: [
            "Animal Science", "Crop Production", "Agricultural Economics and Farm Management", "Agricultural Extension",
            "Quantity Surveying", "Fine Art", "Industrial Design", "Survey and Geo Informatics", "Urban and Rural Planning", "Estate Management", "Environmental Management", "Architecture",
            "Electronics and Computer Engineering", "Mechanical Engineering", "Chemical Engineering", "Aerospace Engineering", "Civil Engineering", "Industrial and Systems Engineering",
            "Diploma"
        ]
    }),
    phoneNumber: text("phone_number"),
    isBlacklisted: boolean("is_blacklisted").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventsTable = pgTable("events", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    date: timestamp("date").notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendanceTable = pgTable("attendance", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    eventId: uuid("event_id").notNull().references(() => eventsTable.id),
    status: text("status", { enum: ["marked", "served"] }).notNull().default("marked"),
    checkInTime: timestamp("check_in_time").defaultNow().notNull(),
    servedAt: timestamp("served_at"),
    servedBy: uuid("served_by").references(() => usersTable.id),
});
