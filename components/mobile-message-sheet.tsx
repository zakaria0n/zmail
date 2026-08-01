"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useSelectionStore } from "@/components/mobile-selection-bridge";
import { MessageViewer } from "@/components/message-viewer/message-viewer";

interface MobileMessageSheetProps {
  messageId: string | null;
  onClose: () => void;
}

/**
 * Full-screen message view for mobile.
 *
 * On small screens the inbox takes the full viewport, and opening a message
 * slides this sheet up from the bottom. On `lg+` the side-by-side layout is
 * used instead, so this component renders nothing.
 */
export function MobileMessageSheet({
  messageId,
  onClose,
}: MobileMessageSheetProps) {
  return (
    <AnimatePresence>
      {messageId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background lg:hidden"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col"
          >
            <div className="h-full overflow-hidden">
              <MessageViewer messageId={messageId} onBack={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Wires the shared selection store to the mobile sheet.
 *
 * Reads the active message id from the store and renders the overlay on
 * mobile only. Closing clears the selection.
 */
export function MobileSelectionController() {
  const messageId = useSelectionStore((s) => s.selectedId);
  const setSelectedId = useSelectionStore((s) => s.setSelectedId);

  return (
    <MobileMessageSheet
      messageId={messageId}
      onClose={() => setSelectedId(null)}
    />
  );
}
