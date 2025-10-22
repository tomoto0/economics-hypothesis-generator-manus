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
  generate: publicProcedure
    .input(
      z.object({
        keywords: z.array(z.string()).length(3),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // キーワードを使用して仮説生成プロンプトを作成
        const keywordString = input.keywords.join(", ");
        const prompt = `You are an expert economist. Based on the following keywords, generate one innovative and feasible economic research hypothesis that reflects the latest economic trends, technological innovations, and social changes.

Keywords: ${keywordString}

Generate an innovative economic research hypothesis that combines these keywords.

Output ONLY a valid JSON object (no additional text before or after) with the following structure:
{
  "title": "Hypothesis title in Japanese",
  "description": "Detailed explanation in Japanese (200-300 characters)",
  "category": "One of: Monetary Policy, Macroeconomics, International Economics, Labor Economics, Environmental Economics, Digital Economics, Financial Markets, Energy Economics",
  "confidence": integer between 70 and 95,
  "researchMethods": ["method1", "method2", "method3"],
  "keyFactors": ["factor1", "factor2", "factor3"],
  "dataSourcesUsed": ["source1", "source2"],
  "policyImplications": ["implication1", "implication2"],
  "noveltyScore": integer between 70 and 95,
  "feasibilityScore": integer between 65 and 95,
  "expectedImpact": "Description of expected impact in Japanese"
}
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
        
        // JSONを抽出（マークダウンコードブロックやその他のテキストを削除）
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Failed to extract JSON from response');
        }
        
        let hypothesisData = JSON.parse(jsonMatch[0]);

        // 仮説データの検証
        const validated = HypothesisSchema.parse(hypothesisData);

        // AI分析コメントを生成
        const analysisPrompt = `Provide a professional critical analysis of the following economic research hypothesis in Japanese:

Title: ${validated.title}
Description: ${validated.description}
Category: ${validated.category}

Analyze from the following perspectives:
1. Theoretical validity
2. Feasibility of empirical research
3. Policy implications
4. Relationship to existing research
5. Suggestions for improvement

Provide a concise and professional comment in Japanese.`;

        const analysisResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert economist providing critical analysis of research hypotheses. Respond in Japanese.",
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
        });

        const analysisContent = analysisResponse.choices[0].message.content;
        const aiComment = typeof analysisContent === 'string' ? analysisContent : 'Analysis not available';

        // データベースに保存
        const hypothesisId = uuidv4();
        await createHypothesis({
          id: hypothesisId,
          ...validated,
          aiComment,
          userId: "anonymous",
        });

        return {
          id: hypothesisId,
          ...validated,
          aiComment: aiComment || '',
          userId: "anonymous",
          createdAt: new Date(),
          generatedAt: new Date(),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Hypothesis generation error:", errorMessage);
        throw new Error(`Failed to generate hypothesis: ${errorMessage}`);
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
     * すべての仮説を取得
     */
    listByUser: publicProcedure.query(async () => {
      return await getAllHypotheses();
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
    create: publicProcedure
      .input(FeedbackSchema)
      .mutation(async ({ input }) => {
        const feedbackId = uuidv4();
        await createFeedback({
          id: feedbackId,
          ...input,
          userId: "anonymous",
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
          userId: "anonymous",
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
    create: publicProcedure
      .input(DiscussionSchema)
      .mutation(async ({ input }) => {
        const discussionId = uuidv4();
        await createDiscussion({
          id: discussionId,
          ...input,
          userId: "anonymous",
        });

        return {
          id: discussionId,
          hypothesisId: input.hypothesisId,
          content: input.content,
          userId: "anonymous",
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

