import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const visitorEntries = sqliteTable("visitor_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  alias: text("alias").notNull(),
  message: text("message").notNull(),
  favorite: text("favorite").notNull(),
  locale: text("locale").notNull().default("pt"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  visible: integer("visible").notNull().default(1),
});

export const visitorRegistry = sqliteTable("visitor_registry", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  instagram: text("instagram").notNull().unique(),
  firstSeenAt: text("first_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  message: text("message"),
  visitorToken: text("visitor_token"),
});

export const galleryPhotos = sqliteTable("gallery_photos", {
  id: text("id").primaryKey(),
  instagram: text("instagram").notNull(),
  objectKey: text("object_key").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const galleryRemovalVotes = sqliteTable("gallery_removal_votes", {
  photoId: text("photo_id").notNull().references(() => galleryPhotos.id, { onDelete: "cascade" }),
  instagram: text("instagram").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [primaryKey({ columns: [table.photoId, table.instagram] })]);
