import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import KeywordDialog from "@/components/KeywordDialog";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeywordDialog, setShowKeywordDialog] = useState(false);

  // 認証チェック
  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const { data: hypotheses, isLoading } = trpc.hypothesis.listAll.useQuery();
  const utils = trpc.useUtils();

  const generateMutation = trpc.hypothesis.generate.useMutation({
    onSuccess: () => {
      utils.hypothesis.listAll.invalidate();
      setShowKeywordDialog(false);
    },
    onError: (error) => {
      console.error("Generation error:", error);
    },
  });

  const handleGenerateHypothesis = async (keywords: [string, string, string]) => {
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync({ keywords });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-blue-600/5">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
            </div>
            <Button
              size="lg"
              onClick={() => setShowKeywordDialog(true)}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  新しい仮説を生成
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* 統計情報 */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                生成済み仮説
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {hypotheses?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均信頼度
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                仮説の実現可能性の指標(70-95)
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {hypotheses && hypotheses.length > 0
                  ? Math.round(
                      hypotheses.reduce((sum: number, h: any) => sum + h.confidence, 0) /
                        hypotheses.length
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均新規性スコア
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                仮説の新しさを示す指標(70-95)
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {hypotheses && hypotheses.length > 0
                  ? Math.round(
                      hypotheses.reduce((sum: number, h: any) => sum + h.noveltyScore, 0) /
                        hypotheses.length
                    )
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 実現可能性スコアの説明 */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border">
          <h3 className="text-sm font-semibold mb-3">スコアについて</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li><strong>信頼度</strong>：仮説の理論的妥当性を示す指標(70-95)</li>
            <li><strong>新規性スコア</strong>：仮説の新しさを示す指標(70-95)</li>
            <li><strong>実現可能性スコア</strong>：仮説を実現できる可能性を示す指標(65-95)</li>
          </ul>
        </div>

        {/* 仮説リスト */}
        <div>
          <h2 className="text-2xl font-bold mb-6">生成済み仮説</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : hypotheses && hypotheses.length > 0 ? (
            <div className="grid gap-6">
              {hypotheses.map((hypothesis: any) => (
                <Card
                  key={hypothesis.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setLocation(`/hypothesis/${hypothesis.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">
                          {hypothesis.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {hypothesis.category}
                        </CardDescription>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-semibold text-primary">
                          {hypothesis.confidence}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          信頼度
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {hypothesis.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  仮説がまだありません
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  「新しい仮説を生成」ボタンをクリックして、
                  最初の仮説を生成しましょう。
                </p>
                <Button
                  onClick={() => setShowKeywordDialog(true)}
                  disabled={isGenerating}
                >
                  {isGenerating ? "生成中..." : "仮説を生成"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* キーワードダイアログ */}
      <KeywordDialog
        open={showKeywordDialog}
        onOpenChange={setShowKeywordDialog}
        onSubmit={handleGenerateHypothesis}
        isLoading={isGenerating}
      />
    </div>
  );
}


