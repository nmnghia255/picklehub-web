"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SocialJoinDialog({
  open,
  onOpenChange,
  title,
  autoApproveJoinRequests,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  autoApproveJoinRequests: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join {title}</DialogTitle>
          <DialogDescription>
            You&apos;re about to join this social event. You&apos;ll be able to
            select specific play sessions after confirming.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          {autoApproveJoinRequests
            ? "Your request will be auto-approved."
            : "This event requires manual approval. You&apos;ll receive a notification once the host reviews your request."}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Confirm Join</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
