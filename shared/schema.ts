import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table - for both job seekers and employers
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  headline: text("headline"),
  bio: text("bio"),
  location: text("location"),
  profileImage: text("profile_image"),
  userType: text("user_type").notNull(), // "job_seeker" or "employer"
  companyName: text("company_name"), // Only for employers
  companyLogo: text("company_logo"), // Only for employers
  skills: text("skills").array(),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Videos table - for both video resumes and job opportunity videos
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  videoType: text("video_type").notNull(), // "resume" or "job"
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  skills: text("skills").array(),
  salary: text("salary"), // Only for job videos
  location: text("location"), // Only for job videos
  jobType: text("job_type"), // Only for job videos
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobVideoId: integer("job_video_id").notNull(),
  userVideoId: integer("user_video_id").notNull(),
  userId: integer("user_id").notNull(),
  employerId: integer("employer_id").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "viewed", "interview", "rejected", "offered"
  note: text("note"),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookmarks table
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  videoId: integer("video_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  views: true,
  likes: true,
  comments: true,
  shares: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  read: true,
  createdAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
