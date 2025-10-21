import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 経済学仮説テーブル
 */
export const hypotheses = mysqlTable("hypotheses", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // 金融政策、マクロ経済学、国際経済学など
  confidence: int("confidence").notNull(), // 70-95
  researchMethods: json("researchMethods").$type<string[]>().notNull(),
  keyFactors: json("keyFactors").$type<string[]>().notNull(),
  dataSourcesUsed: json("dataSourcesUsed").$type<string[]>().notNull(),
  policyImplications: json("policyImplications").$type<string[]>().notNull(),
  noveltyScore: int("noveltyScore").notNull(), // 70-95
  feasibilityScore: int("feasibilityScore").notNull(), // 65-95
  expectedImpact: text("expectedImpact").notNull(),
  aiComment: text("aiComment"), // AI分析コメント
  userId: varchar("userId", { length: 64 }).notNull(), // 生成したユーザー
  generatedAt: timestamp("generatedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Hypothesis = typeof hypotheses.$inferSelect;
export type InsertHypothesis = typeof hypotheses.$inferInsert;

/**
 * フィードバックテーブル
 */
export const feedback = mysqlTable("feedback", {
  id: varchar("id", { length: 64 }).primaryKey(),
  hypothesisId: varchar("hypothesisId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  validityScore: int("validityScore"), // 1-5
  feasibilityScore: int("feasibilityScore"), // 1-5
  noveltyScore: int("noveltyScore"), // 1-5
  policyImportanceScore: int("policyImportanceScore"), // 1-5
  overallScore: int("overallScore"), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;

/**
 * ディスカッション・コメントテーブル
 */
export const discussions = mysqlTable("discussions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  hypothesisId: varchar("hypothesisId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Discussion = typeof discussions.$inferSelect;
export type InsertDiscussion = typeof discussions.$inferInsert;
