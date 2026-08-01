"use client";

import { CheckCircle2, AlertCircle, Info } from "lucide-react";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

/** Maps toast variants to their icon + accent color. */
function ToastIcon({ variant }: { variant?: string }) {
  if (variant === "success") {
    return <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />;
  }
  if (variant === "destructive") {
    return <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />;
  }
  return <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted" />;
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right" duration={5000}>
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast key={id} variant={variant ?? undefined} {...props}>
          <div className="flex w-full items-start gap-3">
            <ToastIcon variant={variant ?? undefined} />
            <div className="grid gap-0.5">
              {title ? <ToastTitle>{title}</ToastTitle> : null}
              {description ? (
                <ToastDescription>{description}</ToastDescription>
              ) : null}
              {action}
            </div>
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
