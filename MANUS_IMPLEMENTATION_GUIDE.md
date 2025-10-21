# 経済学仮説生成システム（Manus版）実装ガイド

## プロジェクト概要

このプロジェクトは、GitHubの「経済学仮説生成システム」をManusのフルスタックAIアプリケーションとして完全に再実装したものです。Manus Built-in LLM APIを活用して、最新の経済動向を反映した革新的な研究仮説を自動生成します。

## 主な機能

### 1. AI駆動の仮説生成
- **Manus LLM API統合**：最新のLLMを使用した高品質な仮説生成
- **専門的な分析コメント**：各仮説に対するAI分析コメント自動生成
- **詳細な仮説構造**：タイトル、説明、カテゴリ、信頼度、研究手法など多角的な情報

### 2. ユーザー認証
- **Manus OAuth統合**：セキュアなユーザー認証
- **ロールベースアクセス制御**：ユーザーと管理者の区別
- **セッション管理**：自動的なセッション管理とクッキー処理

### 3. データベース管理
- **Drizzle ORM**：型安全なデータベースアクセス
- **MySQL対応**：スケーラブルなデータベース
- **自動マイグレーション**：スキーマ変更の自動適用

### 4. フロントエンドUI
- **React 19 + Vite**：高速で最新のフロントエンド開発
- **shadcn/ui**：洗練されたUIコンポーネント
- **Tailwind CSS**：効率的なスタイリング
- **レスポンシブデザイン**：モバイル・タブレット・デスクトップ対応

### 5. コミュニティ機能
- **フィードバック投稿**：各仮説に対する評価とコメント
- **ディスカッション**：ユーザー間の議論と意見交換
- **リアルタイム表示**：フィードバック・ディスカッション数の表示

## システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                    フロントエンド (React)                 │
│  ┌──────────────┬──────────────┬──────────────┐         │
│  │  ホームページ  │ ダッシュボード │  探索ページ   │         │
│  └──────────────┴──────────────┴──────────────┘         │
│                      ↓                                   │
│                  tRPC クライアント                        │
└─────────────────────────────────────────────────────────┘
                        ↓ /api/trpc
┌─────────────────────────────────────────────────────────┐
│                  バックエンド (Express)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │           tRPC ルーター                           │   │
│  │  ┌──────────┬──────────┬──────────────┐         │   │
│  │  │ 仮説生成 │ フィード │ ディスカッション │         │   │
│  │  └──────────┴──────────┴──────────────┘         │   │
│  └──────────────────────────────────────────────────┘   │
│                      ↓                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Manus LLM API                            │   │
│  │  • 仮説生成プロンプト処理                          │   │
│  │  • AI分析コメント生成                             │   │
│  └──────────────────────────────────────────────────┘   │
│                      ↓                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Drizzle ORM + MySQL                      │   │
│  │  • hypotheses テーブル                            │   │
│  │  • feedback テーブル                              │   │
│  │  • discussions テーブル                           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## ファイル構造

```
economics-hypothesis-generator-manus/
├── client/                          # フロントエンド
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # ホームページ
│   │   │   ├── Dashboard.tsx       # ダッシュボード
│   │   │   ├── HypothesisDetail.tsx # 詳細ページ
│   │   │   ├── Explore.tsx         # 探索ページ
│   │   │   └── NotFound.tsx        # 404ページ
│   │   ├── components/             # UIコンポーネント
│   │   ├── lib/
│   │   │   └── trpc.ts            # tRPCクライアント
│   │   ├── App.tsx                # メインアプリケーション
│   │   ├── main.tsx               # エントリーポイント
│   │   └── index.css              # グローバルスタイル
│   └── public/                     # 静的ファイル
├── server/                         # バックエンド
│   ├── routers.ts                 # tRPCルーター
│   ├── db.ts                      # データベースクエリ
│   ├── storage.ts                 # S3ストレージ
│   ├── _core/
│   │   ├── llm.ts                # LLM統合
│   │   ├── context.ts            # tRPCコンテキスト
│   │   ├── trpc.ts               # tRPC設定
│   │   └── ...
│   └── index.ts                  # エントリーポイント
├── drizzle/
│   ├── schema.ts                 # データベーススキーマ
│   └── migrations/               # マイグレーションファイル
├── shared/                        # 共有コード
│   └── const.ts                  # 定数定義
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
└── MANUS_IMPLEMENTATION_GUIDE.md  # このファイル
```

## 主要なAPI エンドポイント

### 仮説生成・管理
- `POST /api/trpc/hypothesis.generate` - 新しい仮説を生成
- `GET /api/trpc/hypothesis.getById` - 仮説を取得
- `GET /api/trpc/hypothesis.listByUser` - ユーザーの仮説一覧
- `GET /api/trpc/hypothesis.listAll` - すべての仮説を取得
- `GET /api/trpc/hypothesis.getDetail` - 詳細情報を取得

### フィードバック
- `POST /api/trpc/feedback.create` - フィードバックを投稿
- `GET /api/trpc/feedback.listByHypothesis` - 仮説のフィードバック一覧

### ディスカッション
- `POST /api/trpc/discussion.create` - ディスカッションコメントを投稿
- `GET /api/trpc/discussion.listByHypothesis` - 仮説のディスカッション一覧

## 環境変数

### 必須環境変数
```
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your_jwt_secret_key
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
```

### オプション環境変数
```
VITE_APP_TITLE=経済学仮説生成システム（Manus版）
VITE_APP_LOGO=https://your-logo-url.png
OWNER_NAME=Owner Name
OWNER_OPEN_ID=owner_id
```

## 開発ワークフロー

### 1. ローカル開発環境のセットアップ

```bash
# 依存関係のインストール
pnpm install

# データベーススキーマのマイグレーション
pnpm db:push

# 開発サーバーの起動
pnpm dev
```

### 2. 新しい機能の追加

#### ステップ1：データベーススキーマの更新
```typescript
// drizzle/schema.ts
export const newTable = mysqlTable("new_table", {
  id: varchar("id", { length: 64 }).primaryKey(),
  // ... カラム定義
});
```

#### ステップ2：マイグレーションの実行
```bash
pnpm db:push
```

#### ステップ3：データベースクエリヘルパーの追加
```typescript
// server/db.ts
export async function getNewData(id: string) {
  const db = await getDb();
  return await db.select().from(newTable).where(eq(newTable.id, id));
}
```

#### ステップ4：tRPCルーターの追加
```typescript
// server/routers.ts
export const appRouter = router({
  newFeature: router({
    getData: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => getNewData(input.id)),
  }),
});
```

#### ステップ5：フロントエンドUIの実装
```typescript
// client/src/pages/NewFeature.tsx
const { data } = trpc.newFeature.getData.useQuery({ id: "123" });
```

## LLM統合の詳細

### 仮説生成プロンプト

```typescript
const prompt = `
あなたは経済学の研究者です。最新の経済動向、技術革新、社会変化を反映した
革新的で実現可能な経済学の研究仮説を1つ生成してください。

[JSON形式の仮説構造]
{
  "title": "仮説のタイトル",
  "description": "詳細な説明",
  "category": "カテゴリ",
  "confidence": 70-95,
  "researchMethods": ["方法1", "方法2"],
  "keyFactors": ["要因1", "要因2"],
  "dataSourcesUsed": ["データソース1"],
  "policyImplications": ["政策含意1"],
  "noveltyScore": 70-95,
  "feasibilityScore": 65-95,
  "expectedImpact": "期待される影響"
}
`;
```

### AI分析コメント生成

```typescript
const analysisPrompt = `
以下の経済学仮説について、専門的な観点から分析コメントを生成してください：

タイトル: ${hypothesis.title}
説明: ${hypothesis.description}

以下の視点から分析してください：
1. 理論的妥当性
2. 実証研究の可能性
3. 政策的含意
4. 既存研究との関連性
5. 改善提案
`;
```

## デプロイメント

### Manusプラットフォームへのデプロイ

1. **プロジェクト管理画面にアクセス**
   - Manusダッシュボードから「経済学仮説生成システム（Manus版）」を選択

2. **パブリッシュボタンをクリック**
   - デプロイ設定画面が表示されます

3. **デプロイ設定を確認**
   - ビルド設定：自動的に検出されます
   - 環境変数：必要な変数をすべて設定してください
   - デプロイ先：本番環境を選択

4. **デプロイを実行**
   - 「デプロイ」ボタンをクリック
   - デプロイが完了するまで待機

### ビルドコマンド

```bash
# フロントエンドのビルド
pnpm build

# バックエンドのビルド（自動）
# Express サーバーは開発時と同じコードで実行されます
```

## トラブルシューティング

### 仮説生成が失敗する場合

1. **LLM API キーの確認**
   - `BUILT_IN_FORGE_API_KEY` が正しく設定されているか確認

2. **プロンプトの確認**
   - LLMが返すレスポンスが有効なJSONか確認

3. **ログの確認**
   - サーバーログで詳細なエラーメッセージを確認

### データベース接続エラー

1. **DATABASE_URL の確認**
   - 接続文字列が正しいか確認
   - ユーザー名、パスワード、ホスト、ポート、データベース名を確認

2. **マイグレーションの再実行**
   ```bash
   pnpm db:push
   ```

3. **データベースサーバーの状態確認**
   - MySQLサーバーが起動しているか確認

## セキュリティに関する注意

1. **環境変数の管理**
   - `.env` ファイルをGitに含めない
   - 本番環境では安全な方法で環境変数を設定

2. **認証の確認**
   - 保護されたエンドポイントは `protectedProcedure` を使用
   - ユーザーIDの検証を厳密に行う

3. **データベースのセキュリティ**
   - SQLインジェクション対策：Drizzle ORMが自動的に対応
   - アクセス制御：ユーザーロールに基づいた制御

## パフォーマンス最適化

1. **キャッシング**
   - tRPC クエリはクライアント側でキャッシュされます
   - 必要に応じて `invalidate()` でキャッシュをクリア

2. **データベースインデックス**
   - 頻繁に検索される列にインデックスを追加

3. **バンドルサイズの最適化**
   - 不要な依存関係を削除
   - 動的インポートを活用

## 今後の拡張機能

1. **仮説の比較機能**
   - 複数の仮説を並べて比較

2. **高度な検索・フィルタリング**
   - 信頼度、新規性スコア、実現可能性スコアでのフィルタリング

3. **エクスポート機能**
   - 仮説をPDF、CSV形式でエクスポート

4. **通知機能**
   - フィードバック・ディスカッションの新規投稿を通知

5. **ユーザープロフィール**
   - ユーザーの生成した仮説履歴を表示
   - フォロー機能

## サポート

質問や問題がある場合は、以下の方法でサポートを受けてください：

1. **ドキュメント**
   - このガイドを参照

2. **Manusサポート**
   - https://help.manus.im

3. **GitHub Issues**
   - 元のリポジトリで問題を報告

## ライセンス

このプロジェクトはMIT ライセンスの下で公開されています。

---

**最終更新日**：2025年10月21日
**バージョン**：1.0.0

