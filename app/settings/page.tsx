"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Database,
  Download,
  RefreshCw,
  Settings as SettingsIcon,
  Trash2,
  Upload,
} from "lucide-react";

import { SettingsRow } from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { exportMailboxes, parseImportedMailboxes } from "@/hooks/use-mailboxes";
import { toast } from "@/hooks/use-toast";
import { useMailboxStore } from "@/store/mailbox-store";
import { useSettingsStore } from "@/store/settings-store";
import { clearAllData } from "@/utils/storage";
import { downloadText } from "@/utils/download";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const REFRESH_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "5s", value: 5_000 },
  { label: "10s", value: 10_000 },
  { label: "30s", value: 30_000 },
  { label: "60s", value: 60_000 },
];

/** /settings — app configuration, data management, import/export. */
export default function SettingsPage() {
  const settings = useSettingsStore();
  const mailboxes = useMailboxStore((s) => s.mailboxes);
  const replaceAll = useMailboxStore((s) => s.replaceAll);
  const resetStore = useMailboxStore((s) => s.reset);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [clearOpen, setClearOpen] = React.useState(false);

  const handleExport = () => {
    if (mailboxes.length === 0) {
      toast({ title: "Nothing to export", variant: "destructive" });
      return;
    }
    const json = exportMailboxes(mailboxes);
    downloadText("zmail-mailboxes.json", json, "application/json");
    toast({ title: "Exported mailboxes", variant: "success" });
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-importing the same file
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseImportedMailboxes(text);
      if (imported.length === 0) {
        throw new Error("No valid mailboxes found in the file.");
      }
      // Merge by id, imported entries win on conflict.
      const existing = useMailboxStore.getState().mailboxes;
      const map = new Map(existing.map((m) => [m.id, m]));
      for (const m of imported) map.set(m.id, m);
      const merged = [...map.values()];
      replaceAll(merged, useMailboxStore.getState().activeId);
      toast({
        title: `Imported ${imported.length} mailbox${imported.length === 1 ? "" : "es"}`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description:
          error instanceof Error ? error.message : "Invalid JSON file.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = () => {
    clearAllData();
    resetStore();
    settings.reset();
    setClearOpen(false);
    toast({ title: "All local data cleared", variant: "success" });
  };

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-20 pt-12 sm:pt-16 md:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center gap-3"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted">
            Configure your inbox and manage local data.
          </p>
        </div>
      </motion.div>

      {/* Inbox */}
      <SettingsGroup title="Inbox" icon={<RefreshCw className="h-4 w-4" />}>
        <SettingsRow
          title="Auto-refresh inbox"
          description="Poll for new mail automatically while the app is open."
          control={
            <Switch
              checked={settings.autoRefreshEnabled}
              onCheckedChange={(v) => settings.update({ autoRefreshEnabled: v })}
            />
          }
        />
        <SettingsRow
          title="Refresh interval"
          description="How often to check for new mail."
          control={
            <select
              value={
                settings.autoRefreshEnabled
                  ? settings.refreshIntervalMs
                  : 0
              }
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value === 0) {
                  settings.update({ autoRefreshEnabled: false });
                } else {
                  settings.update({
                    autoRefreshEnabled: true,
                    refreshIntervalMs: value,
                  });
                }
              }}
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {REFRESH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          }
        />
      </SettingsGroup>

      {/* Mailbox lifetime */}
      <SettingsGroup title="Mailbox lifetime" icon={<Clock className="h-4 w-4" />}>
        <SettingsRow
          title="Auto-delete after 7 days"
          description="Mailboxes older than 7 days are removed from this device on startup."
          control={
            <Switch
              checked={settings.pruneExpiredEnabled}
              onCheckedChange={(v) => settings.update({ pruneExpiredEnabled: v })}
            />
          }
        />
      </SettingsGroup>

      {/* Data management */}
      <SettingsGroup title="Data" icon={<Database className="h-4 w-4" />}>
        <SettingsRow
          title="Export mailboxes"
          description={`Download all ${mailboxes.length} mailbox${mailboxes.length === 1 ? "" : "es"} as a JSON backup.`}
          control={
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={mailboxes.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          }
        />
        <SettingsRow
          title="Import mailboxes"
          description="Restore mailboxes from a previously exported JSON file (merged)."
          control={
            <Button
              onClick={handleImportClick}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </Button>
          }
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          className="hidden"
        />
        <SettingsRow
          title="Clear all local data"
          description="Permanently remove every mailbox, setting and credential from this device."
          control={
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setClearOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </TooltipTrigger>
              <TooltipContent>This cannot be undone</TooltipContent>
            </Tooltip>
          }
        />
      </SettingsGroup>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear all local data?</DialogTitle>
            <DialogDescription>
              Every mailbox, password and setting on this device will be
              permanently deleted. The mail.tm mailboxes themselves are not
              affected. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** A titled group of settings rows. */
function SettingsGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="text-muted">{icon}</span>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
          {title}
        </h2>
      </div>
      <div className={cn("space-y-2")}>{children}</div>
    </motion.div>
  );
}
