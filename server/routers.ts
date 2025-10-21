import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  createHypothesis,
  getHypothesisById,
  getHypothesesByUser,
  getAllHypotheses,
  createFeedback,
  getFeedbackByHypothesis,
  createDiscussion,
  getDiscussionsByHypothesis,
  getHypothesisWithFeedbackAndDiscussions,
} from "./db";
import { invokeLLM } from "./_core/llm";

const HypothesisSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  confidence: z.number().int().min(70).max(95),
  researchMethods: z.array(z.string()),
  keyFactors: z.array(z.string()),
  dataSourcesUsed: z.array(z.string()),
  policyImplications: z.array(z.string()),
  noveltyScore: z.number().int().min(70).max(95),
  feasibilityScore: z.number().int().min(65).max(95),
  expectedImpact: z.string().min(1),
});

const FeedbackSchema = z.object({
  hypothesisId: z.string(),
  validityScore: z.number().int().min(1).max(5).optional(),
  feasibilityScore: z.number().int().min(1).max(5).optional(),
  noveltyScore: z.number().int().min(1).max(5).optional(),
  policyImportanceScore: z.number().int().min(1).max(5).optional(),
  overallScore: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

const DiscussionSchema = z.object({
  hypothesisId: z.string(),
  content: z.string().min(1),
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * 仮説生成・管理ルーター
   */
  hypothesis: router({
    /**
     * 新しい仮説を生成（AI駆動）
     */
    generate: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        // LLMに仮説生成プロンプトを送信
        const prompt = `
あなたは経済学の研究者です。最新の経済動向、技術革新、社会変化を反映した革新的で実現可能な経済学の研究仮説を1つ生成してください。

以下のJSON形式で出力してください：
{
  "title": "仮説のタイトル",
  "description": "詳細な説明（200-300文字）",
  "category": "カテゴリ（金融政策、マクロ経済学、国際経済学、労働経済学、環境経済学、デジタル経済学、金融市場、エネルギー経済学のいずれか）",
  "confidence": 70-95の整数,
  "researchMethods": ["研究手法1", "研究手法2", "研究手法3"],
  "keyFactors": ["重要要因1", "重要要因2", "重要要因3"],
  "dataSourcesUsed": ["データソース1", "データソース2"],
  "policyImplications": ["政策含意1", "政策含意2"],
  "noveltyScore": 70-95の整数,
  "feasibilityScore": 65-95の整数,
  "expectedImpact": "期待される影響の説明"
}

JSONのみを出力してください。
        `;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert economist. Generate innovative and feasible research hypotheses in economics. Output only valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        // レスポンスからJSONを抽出
        const messageContent = response.choices[0].message.content;
        const content = typeof messageContent === 'string' ? messageContent : '';
        let hypothesisData = JSON.parse(content);

        // 仮説データの検証
        const validated = HypothesisSchema.parse(hypothesisData);

        // AI分析コメントを生成
        const analysisPrompt = `
以下の経済学仮説について、専門的な観点から分析コメントを生成してください：

タイトル: ${validated.title}
説明: ${validated.description}
カテゴリ: ${validated.category}

以下の視点から分析してください：
1. 理論的妥当性
2. 実証研究の可能性
3. 政策的含意
4. 既存研究との関連性
5. 改善提案

簡潔で専門的なコメントを生成してください。
        `;

        const analysisResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert economist providing critical analysis of research hypotheses.",
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
        });

        const analysisContent = analysisResponse.choices[0].message.content;
        const aiComment = typeof analysisContent === 'string' ? analysisContent : '';

        // データベースに保存
        const hypothesisId = uuidv4();
        await createHypothesis({
          id: hypothesisId,
          ...validated,
          aiComment,
          userId: ctx.user.id,
        });

        return {
          id: hypothesisId,
          ...validated,
          aiComment: aiComment || '',
          userId: ctx.user.id,
          createdAt: new Date(),
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("Hypothesis generation error:", error);
        throw new Error("Failed to generate hypothesis");
      }
    }),

    /**
     * 仮説を取得
     */
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await getHypothesisById(input.id);
      }),

    /**
     * ユーザーの仮説一覧を取得
     */
    listByUser: protectedProcedure.query(async ({ ctx }) => {
      return await getHypothesesByUser(ctx.user.id);
    }),

    /**
     * すべての仮説を取得
     */
    listAll: publicProcedure.query(async () => {
      return await getAllHypotheses();
    }),

    /**
     * 仮説の詳細情報を取得（フィードバック・ディスカッション含む）
     */
    getDetail: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await getHypothesisWithFeedbackAndDiscussions(input.id);
      }),
  }),

  /**
   * フィードバックルーター
   */
  feedback: router({
    /**
     * フィードバックを投稿
     */
    create: protectedProcedure
      .input(FeedbackSchema)
      .mutation(async ({ ctx, input }) => {
        const feedbackId = uuidv4();
        await createFeedback({
          id: feedbackId,
          ...input,
          userId: ctx.user.id,
        });

        return {
          id: feedbackId,
          hypothesisId: input.hypothesisId,
          validityScore: input.validityScore,
          feasibilityScore: input.feasibilityScore,
          noveltyScore: input.noveltyScore,
          policyImportanceScore: input.policyImportanceScore,
          overallScore: input.overallScore,
          comment: input.comment,
          userId: ctx.user.id,
          createdAt: new Date(),
        };
      }),

    /**
     * 仮説に対するフィードバック一覧を取得
     */
    listByHypothesis: publicProcedure
      .input(z.object({ hypothesisId: z.string() }))
      .query(async ({ input }) => {
        return await getFeedbackByHypothesis(input.hypothesisId);
      }),
  }),

  /**
   * ディスカッションルーター
   */
  discussion: router({
    /**
     * ディスカッションコメントを投稿
     */
    create: protectedProcedure
      .input(DiscussionSchema)
      .mutation(async ({ ctx, input }) => {
        const discussionId = uuidv4();
        await createDiscussion({
          id: discussionId,
          ...input,
          userId: ctx.user.id,
        });

        return {
          id: discussionId,
          hypothesisId: input.hypothesisId,
          content: input.content,
          userId: ctx.user.id,
          createdAt: new Date(),
        };
      }),

    /**
     * 仮説に対するディスカッション一覧を取得
     */
    listByHypothesis: publicProcedure
      .input(z.object({ hypothesisId: z.string() }))
      .query(async ({ input }) => {
        return await getDiscussionsByHypothesis(input.hypothesisId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

