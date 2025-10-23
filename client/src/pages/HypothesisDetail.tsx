import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, MessageSquare, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

export default function HypothesisDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/hypothesis/:id");
  const { user, isAuthenticated } = useAuth();
  const [feedbackComment, setFeedbackComment] = useState("");
  const [discussionComment, setDiscussionComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isSubmittingDiscussion, setIsSubmittingDiscussion] = useState(false);

  if (!match) {
    return null;
  }

  const hypothesisId = params?.id || "";

  // 仮説の詳細情報を取得
  const { data: hypothesis, isLoading } = trpc.hypothesis.getDetail.useQuery({
    id: hypothesisId,
  });

  // フィードバック投稿ミューテーション
  const feedbackMutation = trpc.feedback.create.useMutation({
    onSuccess: () => {
      setIsSubmittingFeedback(false);
      setFeedbackComment("");
    },
    onError: (error) => {
      setIsSubmittingFeedback(false);
      console.error("Feedback error:", error);
    },
  });

  // ディスカッション投稿ミューテーション
  const discussionMutation = trpc.discussion.create.useMutation({
    onSuccess: () => {
      setIsSubmittingDiscussion(false);
      setDiscussionComment("");
    },
    onError: (error) => {
      setIsSubmittingDiscussion(false);
      console.error("Discussion error:", error);
    },
  });

  const handleSubmitFeedback = async () => {
    if (!feedbackComment.trim() || !isAuthenticated) return;
    setIsSubmittingFeedback(true);
    await feedbackMutation.mutateAsync({
      hypothesisId,
      comment: feedbackComment,
    });
  };

  const handleSubmitDiscussion = async () => {
    if (!discussionComment.trim() || !isAuthenticated) return;
    setIsSubmittingDiscussion(true);
    await discussionMutation.mutateAsync({
      hypothesisId,
      content: discussionComment,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hypothesis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">仮説が見つかりません</h2>
          <Button onClick={() => setLocation("/dashboard")} variant="outline">
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-blue-600/5">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
          <h1 className="text-3xl font-bold">{hypothesis.title}</h1>
          <p className="text-muted-foreground mt-2">{hypothesis.category}</p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>仮説の詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">説明</h3>
                <p className="text-muted-foreground">{hypothesis.description}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    信頼度
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {hypothesis.confidence}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    新規性スコア
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {hypothesis.noveltyScore}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    実現可能性スコア
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {hypothesis.feasibilityScore}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">期待される影響</h3>
                <p className="text-muted-foreground">
                  {hypothesis.expectedImpact}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">研究手法</h3>
                  <ul className="space-y-2">
                    {hypothesis.researchMethods.map((method, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {method}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">重要要因</h3>
                  <ul className="space-y-2">
                    {hypothesis.keyFactors.map((factor, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">データソース</h3>
                  <ul className="space-y-2">
                    {hypothesis.dataSourcesUsed.map((source, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {source}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">政策的含意</h3>
                  <ul className="space-y-2">
                    {hypothesis.policyImplications.map((implication, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {implication}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI分析コメント */}
          {hypothesis.aiComment && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">AI分析コメント</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-bold mt-2 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="ml-2" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                      code: ({node, ...props}) => <code className="bg-muted px-1 rounded text-xs" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-2" {...props} />,
                    }}
                  >
                    {hypothesis.aiComment}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {/* フィードバックセクション */}
          {isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">フィードバックを投稿</CardTitle>
                <CardDescription>
                  この仮説についてのご意見をお聞かせください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="フィードバックを入力..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="min-h-24"
                />
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmittingFeedback || !feedbackComment.trim()}
                  className="gap-2"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      投稿中...
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4" />
                      フィードバックを投稿
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* フィードバック一覧 */}
          {hypothesis.feedback && hypothesis.feedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  フィードバック ({hypothesis.feedback.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hypothesis.feedback.map((fb) => (
                  <div key={fb.id} className="border-b border-border/50 pb-4 last:border-0">
                    {fb.comment && (
                      <p className="text-muted-foreground mb-2">{fb.comment}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString("ja-JP") : ""}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ディスカッションセクション */}
          {isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ディスカッション</CardTitle>
                <CardDescription>
                  この仮説について議論しましょう
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="コメントを入力..."
                  value={discussionComment}
                  onChange={(e) => setDiscussionComment(e.target.value)}
                  className="min-h-24"
                />
                <Button
                  onClick={handleSubmitDiscussion}
                  disabled={isSubmittingDiscussion || !discussionComment.trim()}
                  className="gap-2"
                  variant="outline"
                >
                  {isSubmittingDiscussion ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      投稿中...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      コメントを投稿
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ディスカッション一覧 */}
          {hypothesis.discussions && hypothesis.discussions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ディスカッション ({hypothesis.discussions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hypothesis.discussions.map((disc) => (
                  <div key={disc.id} className="border-b border-border/50 pb-4 last:border-0">
                    <p className="text-muted-foreground mb-2">{disc.content}</p>
                    <div className="text-xs text-muted-foreground">
                      {disc.createdAt ? new Date(disc.createdAt).toLocaleDateString("ja-JP") : ""}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

