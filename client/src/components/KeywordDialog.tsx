import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface KeywordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (keywords: [string, string, string]) => Promise<void>;
  isLoading?: boolean;
}

export default function KeywordDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: KeywordDialogProps) {
  const [keywords, setKeywords] = useState<[string, string, string]>([
    "",
    "",
    "",
  ]);

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...keywords] as [string, string, string];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const handleSubmit = async () => {
    if (keywords.every((k) => k.trim())) {
      await onSubmit(keywords);
      setKeywords(["", "", ""]);
      onOpenChange(false);
    }
  };

  const isValid = keywords.every((k) => k.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>仮説生成用キーワードを入力</DialogTitle>
          <DialogDescription>
            3つのキーワードを入力してください。これらのキーワードに基づいて、
            AIが経済学の研究仮説を生成します。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`keyword-${index}`} className="text-right">
                キーワード {index + 1}
              </Label>
              <Input
                id={`keyword-${index}`}
                placeholder={
                  index === 0
                    ? "例: AI"
                    : index === 1
                      ? "例: 経済"
                      : "例: イノベーション"
                }
                value={keywords[index]}
                onChange={(e) => handleKeywordChange(index, e.target.value)}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              "生成する"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

