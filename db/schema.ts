import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
  instagram: text("instagram").notNull().unique(),
  objectKey: text("object_key").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const galleryRemovalVotes = sqliteTable("gallery_removal_votes", {
  photoId: text("photo_id").notNull().references(() => galleryPhotos.id, { onDelete: "cascade" }),
  instagram: text("instagram").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [primaryKey({ columns: [table.photoId, table.instagram] })]);

export const galleryVoteOrigins = sqliteTable("gallery_vote_origins", {
  photoId: text("photo_id").notNull().references(() => galleryPhotos.id, { onDelete: "cascade" }),
  fingerprint: text("fingerprint").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [primaryKey({ columns: [table.photoId, table.fingerprint] })]);

export const abuseEvents = sqliteTable("abuse_events", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  fingerprint: text("fingerprint").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("abuse_events_lookup_idx").on(table.kind, table.fingerprint, table.createdAt),
  index("abuse_events_created_at_idx").on(table.createdAt),
]);
