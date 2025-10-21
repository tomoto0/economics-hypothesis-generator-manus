import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, hypotheses, InsertHypothesis, feedback, InsertFeedback, discussions, InsertDiscussion } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * 仮説関連のクエリ
 */
export async function createHypothesis(data: InsertHypothesis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(hypotheses).values(data);
  return result;
}

export async function getHypothesisById(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(hypotheses)
    .where(eq(hypotheses.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getHypothesesByUser(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(hypotheses)
    .where(eq(hypotheses.userId, userId))
    .orderBy(hypotheses.createdAt);
}

export async function getAllHypotheses() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(hypotheses)
    .orderBy(hypotheses.createdAt);
}

/**
 * フィードバック関連のクエリ
 */
export async function createFeedback(data: InsertFeedback) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(feedback).values(data);
}

export async function getFeedbackByHypothesis(hypothesisId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(feedback)
    .where(eq(feedback.hypothesisId, hypothesisId))
    .orderBy(feedback.createdAt);
}

/**
 * ディスカッション関連のクエリ
 */
export async function createDiscussion(data: InsertDiscussion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(discussions).values(data);
}

export async function getDiscussionsByHypothesis(hypothesisId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select()
    .from(discussions)
    .where(eq(discussions.hypothesisId, hypothesisId))
    .orderBy(discussions.createdAt);
}

export async function getHypothesisWithFeedbackAndDiscussions(hypothesisId: string) {
  const hypothesis = await getHypothesisById(hypothesisId);
  if (!hypothesis) return null;
  
  const feedbackList = await getFeedbackByHypothesis(hypothesisId);
  const discussionList = await getDiscussionsByHypothesis(hypothesisId);
  
  return {
    ...hypothesis,
    feedback: feedbackList,
    discussions: discussionList,
  };
}
