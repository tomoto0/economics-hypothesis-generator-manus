import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Sparkles, TrendingUp, Users, Zap } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* ナビゲーションバー */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {APP_LOGO && <img src={APP_LOGO} alt="logo" className="h-8 w-8" />}
            <h1 className="text-xl font-bold">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="default">ダッシュボード</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="default">ログイン</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="container max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI駆動の研究仮説生成</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            経済学の新しい研究仮説を
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              AI で自動生成
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            最新の経済動向と技術革新を反映した、革新的で実現可能な研究仮説を自動生成します。
            経済学研究の新しいアイデア創出をサポートします。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    <Zap className="h-5 w-5" />
                    仮説を生成する
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline">
                    生成済み仮説を閲覧
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2">
                    <Zap className="h-5 w-5" />
                    はじめる
                  </Button>
                </a>
                <Link href="/explore">
                  <Button size="lg" variant="outline">
                    デモを見る
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">主な機能</h3>
          <p className="text-muted-foreground text-lg">
            経済学研究を次のレベルへ
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI駆動の仮説生成</CardTitle>
              <CardDescription>
                最新のLLMを活用した革新的な研究仮説の自動生成
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                経済動向、技術革新、社会変化を反映した実現可能な仮説を生成します。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>詳細な分析</CardTitle>
              <CardDescription>
                各仮説に対する専門的なAI分析コメント
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                理論的妥当性、実証研究の可能性、政策的含意など多角的な分析を提供します。
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>コミュニティ機能</CardTitle>
              <CardDescription>
                フィードバックとディスカッションで知見を共有
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                他の研究者とのフィードバック・ディスカッションを通じて、仮説をブラッシュアップできます。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <div className="rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-blue-600/5 p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">
            経済学研究の新しい可能性を探索しましょう
          </h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            AIの力を活用して、革新的な研究仮説を生成し、
            経済学の研究を次のレベルへ進めます。
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2">
                <Zap className="h-5 w-5" />
                今すぐ始める
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-border/50 mt-20 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">製品</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">ダッシュボード</Link></li>
                <li><Link href="/explore" className="hover:text-foreground transition-colors">仮説一覧</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">ドキュメント</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">会社</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">について</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">プライバシー</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">その他</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">利用規約</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">お問い合わせ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 {APP_TITLE}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

