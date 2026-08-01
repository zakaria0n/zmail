"use client";

/**
 * Selection store + wiring for the mobile message overlay.
 *
 * The desktop workspace manages which message is "active" for its side panel;
 * on mobile that same selection drives a full-screen sheet. Rather than
 * prop-drill through server components, we keep the id in this tiny store.
 */

import { create } from "zustand";

interface SelectionState {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
}));
