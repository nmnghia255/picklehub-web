import { CalendarDays, MapPin, Trophy, UserRound, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { competitionsHistory } from "@/features/history/mock-data/competitions-history"
import { matchesHistory } from "@/features/history/mock-data/matches-history"
import { sessionHistory } from "@/features/history/mock-data/session-history"

function ResultBadge({ result }: { result: "Thắng" | "Thua" }) {
  return (
    <Badge variant={result === "Thắng" ? "default" : "secondary"}>
      {result}
    </Badge>
  )
}

export default function HistoryPage() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Lịch sử</h1>
      </div>

      <Tabs defaultValue="sessions" className="gap-4">
        <TabsList className="w-full sm:w-fit" variant="line">
          <TabsTrigger value="sessions">Buổi</TabsTrigger>
          <TabsTrigger value="matches">Trận đấu</TabsTrigger>
          <TabsTrigger value="competitions">Giải đấu</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          {sessionHistory.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="size-4" />
                  {session.date}
                </CardTitle>
                <CardDescription>
                  Buổi tập luyện nhóm do quản trị viên tổ chức.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span>{session.memberCount} thành viên</span>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <MapPin className="size-4" />
                  <span>{session.address}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          {matchesHistory.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 text-lg">
                  <span className="flex items-center gap-2">
                    <UserRound className="size-4" />
                    {match.opponent}
                  </span>
                  <ResultBadge result={match.result as "Thắng" | "Thua"} />
                </CardTitle>
                <CardDescription>
                  {match.mode} • {match.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Kết quả:{" "}
                <span className="font-medium text-foreground">
                  {match.score}
                </span>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="competitions" className="space-y-4">
          {competitionsHistory.map((competition) => (
            <Card key={competition.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="size-4" />
                  {competition.title}
                </CardTitle>
                <CardDescription>
                  {competition.level} • {competition.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Xếp hạng:{" "}
                <span className="font-medium text-foreground">
                  {competition.placement}
                </span>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
