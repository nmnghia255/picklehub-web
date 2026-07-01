"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useMyCoachProfile, useRecommendCoach } from "../hooks/use-coach-queries"

export function CoachRecommendation() {
  const { data: profile } = useMyCoachProfile()
  const recommendMutation = useRecommendCoach()
  const [recommendToId, setRecommendToId] = useState("")
  const [message, setMessage] = useState("")
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    if (!profile?.id || !recommendToId.trim()) return
    recommendMutation.mutate(
      {
        coachId: profile.id,
        dto: {
          recommendedToId: recommendToId.trim(),
          message: message.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false)
          setRecommendToId("")
          setMessage("")
        },
      }
    )
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>Đề xuất HLV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Giới thiệu huấn luyện viên này đến bạn bè hoặc học viên khác.
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">Gửi đề xuất</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gửi đề xuất huấn luyện viên</DialogTitle>
              <DialogDescription>
                Nhập ID người dùng và lời nhắn (tuỳ chọn) để đề xuất HLV này.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recommendToId">ID người nhận</Label>
                <Input
                  id="recommendToId"
                  value={recommendToId}
                  onChange={(e) => setRecommendToId(e.target.value)}
                  placeholder="Nhập User ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommendMessage">Lời nhắn</Label>
                <Textarea
                  id="recommendMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Tôi nghĩ bạn sẽ thích HLV này vì..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={recommendMutation.isPending || !recommendToId.trim()}
              >
                {recommendMutation.isPending ? "Đang gửi..." : "Gửi đề xuất"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {recommendMutation.isSuccess && (
          <p className="text-sm font-medium text-green-600">
            Đã gửi đề xuất thành công!
          </p>
        )}

        {recommendMutation.isError && (
          <p className="text-sm font-medium text-destructive">
            {recommendMutation.error?.message ?? "Gửi đề xuất thất bại."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
