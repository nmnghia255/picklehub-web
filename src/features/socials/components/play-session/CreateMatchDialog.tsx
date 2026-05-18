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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export default function CreateMatchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Match</DialogTitle>
          <DialogDescription>
            Schedule a new match for this play session.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Court Number">
            <Input type="number" />
          </Field>
          <Field label="Start Time">
            <Input type="datetime-local" />
          </Field>
          <p className="text-sm text-muted-foreground">
            Select participants from the list to create teams.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Create Match</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
