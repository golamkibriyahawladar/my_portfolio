'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  destructive?: boolean
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#121216] border-white/10 text-white sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-base text-white">{title}</DialogTitle>
          <DialogDescription className="text-xs text-white/60">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-white/10 text-white hover:bg-white/5 text-xs"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className={`text-xs ${
              destructive
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-[#a3e635] text-black hover:bg-[#bef264]'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
