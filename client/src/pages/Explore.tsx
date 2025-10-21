import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

const CATEGORIES = [
  "金融政策",
  "マクロ経済学",
  "国際経済学",
  "労働経済学",
  "環境経済学",
  "デジタル経済学",
  "金融市場",
  "エネルギー経済学",
];

export default function Explore() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // すべての仮説を取得
  const { data: hypotheses, isLoading } = trpc.hypothesis.listAll.useQuery();

  // フィルタリングと検索
  const filteredHypotheses = useMemo(() => {
    if (!hypotheses) return [];

    return hypotheses.filter((h) => {
      const matchesSearch =
        h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || h.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [hypotheses, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-blue-600/5">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">仮説を探索</h1>
          <p className="text-muted-foreground">
            生成された経済学の研究仮説を検索・閲覧できます
          </p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            {/* 検索 */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">検索</h3>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="キーワードで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* カテゴリフィルター */}
            <div>
              <h3 className="font-semibold mb-4">カテゴリ</h3>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  すべて
                </Button>
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredHypotheses.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-6">
                  {filteredHypotheses.length} 件の仮説が見つかりました
                </p>
                {filteredHypotheses.map((hypothesis) => (
                  <Card
                    key={hypothesis.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setLocation(`/hypothesis/${hypothesis.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-2">
                            {hypothesis.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {hypothesis.category}
                          </CardDescription>
                        </div>
                        <div className="text-right flex-shrink-0">
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
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {hypothesis.description}
                      </p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            新規性
                          </div>
                          <div className="font-semibold text-sm">
                            {hypothesis.noveltyScore}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            実現可能性
                          </div>
                          <div className="font-semibold text-sm">
                            {hypothesis.feasibilityScore}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            生成日
                          </div>
                          <div className="font-semibold text-sm">
                            {hypothesis.createdAt
                              ? new Date(
                                  hypothesis.createdAt
                                ).toLocaleDateString("ja-JP")
                              : ""}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    仮説が見つかりません
                  </h3>
                  <p className="text-muted-foreground text-center">
                    検索条件を変更してお試しください
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

