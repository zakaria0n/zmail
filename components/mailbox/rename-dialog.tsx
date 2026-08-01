"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Mailbox } from "@/types";

interface RenameDialogProps {
  mailbox: Mailbox | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string, label: string) => void;
}

/** Modal for editing a mailbox's optional label. */
export function RenameDialog({
  mailbox,
  open,
  onOpenChange,
  onConfirm,
}: RenameDialogProps) {
  const [label, setLabel] = React.useState("");

  React.useEffect(() => {
    if (mailbox) setLabel(mailbox.label ?? "");
  }, [mailbox]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailbox) return;
    onConfirm(mailbox.id, label.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename mailbox</DialogTitle>
            <DialogDescription>
              Give this inbox a memorable label. The email address itself
              can&apos;t change.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <Input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={mailbox?.address.split("@")[0] ?? "e.g. Work"}
              maxLength={32}
            />
            {mailbox ? (
              <p className="truncate font-mono text-xs text-muted">
                {mailbox.address}
              </p>
            ) : null}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
