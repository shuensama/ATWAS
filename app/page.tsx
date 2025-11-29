import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stage-bg text-stage-text">
      <Card className="max-w-2xl mx-4">
        <CardHeader>
          <CardTitle>AI 情景剧舞台（多 AI 角色轮流对话）</CardTitle>
          <CardDescription>
            基于 Next.js 14 App Router 的单体应用入口。
            在这里你可以配置场景与多名 AI
            演员角色，启动一场情景剧演出，并在结束后回看完整历史。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/(drama-stage)">
              <Button>进入 AI 情景剧舞台</Button>
            </Link>
            <Link href="/(drama-stage)/history">
              <Button variant="outline">查看历史演出</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
