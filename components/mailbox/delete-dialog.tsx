"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Mailbox } from "@/types";

interface DeleteDialogProps {
  mailbox: Mailbox | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
}

/** Confirmation modal before deleting a mailbox. */
export function DeleteDialog({
  mailbox,
  open,
  onOpenChange,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this mailbox?</DialogTitle>
          <DialogDescription>
            This removes the inbox from your device.{" "}
            <span className="font-mono text-foreground/80">
              {mailbox?.address}
            </span>{" "}
            will no longer be available locally. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (mailbox) onConfirm(mailbox.id);
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
