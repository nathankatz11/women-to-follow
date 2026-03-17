import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";

export const nominees = pgTable("nominees", {
  id: uuid("id").defaultRandom().primaryKey(),
  handle: text("handle").notNull().unique(),
  name: text("name"),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  followerCount: integer("follower_count"),
  xUserId: text("x_user_id"),
  isFeatured: boolean("is_featured").default(false),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const nominations = pgTable("nominations", {
  id: uuid("id").defaultRandom().primaryKey(),
  nominatorHandle: text("nominator_handle"),
  nominatorIp: text("nominator_ip"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nominationNominees = pgTable(
  "nomination_nominees",
  {
    nominationId: uuid("nomination_id")
      .notNull()
      .references(() => nominations.id),
    nomineeId: uuid("nominee_id")
      .notNull()
      .references(() => nominees.id),
    reason: text("reason"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.nominationId, t.nomineeId] }),
  })
);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});
