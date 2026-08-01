"use client";

import { motion } from "framer-motion";

/**
 * Ambient, animated background.
 *
 * Layered radial gradients + a subtle grid + floating glow orbs. Purely
 * decorative and pointer-events-none so it never interferes with interaction.
 * The motion is intentionally slow and GPU-friendly (transform/opacity only).
 */
export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base wash */}
      <div className="absolute inset-0 bg-background" />

      {/* Primary green glow, top-left */}
      <motion.div
        className="absolute -left-[10%] -top-[20%] h-[55vw] w-[55vw] rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(34,197,94,0.30), transparent 60%)",
        }}
        animate={{ x: [0, 60, -20, 0], y: [0, 40, 80, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary lime glow, bottom-right */}
      <motion.div
        className="absolute -right-[15%] bottom-[-25%] h-[50vw] w-[50vw] rounded-full opacity-50 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(163,230,53,0.22), transparent 60%)",
        }}
        animate={{ x: [0, -50, 30, 0], y: [0, -30, -60, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Small accent orb */}
      <motion.div
        className="absolute left-[40%] top-[30%] h-[25vw] w-[25vw] rounded-full opacity-30 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(34,197,94,0.25), transparent 60%)",
        }}
        animate={{ y: [0, -40, 0], opacity: [0.3, 0.45, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Faint grid */}
      <div
        className="absolute inset-0 bg-grid-pattern opacity-[0.35]"
        style={{ backgroundSize: "56px 56px" }}
      />

      {/* Top + bottom vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
    </div>
  );
}
