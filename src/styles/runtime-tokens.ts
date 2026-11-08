// Tokens consumed by JS animation libraries and server-rendered email.
// Browser CSS remains in tokens.css; email cannot inherit browser CSS variables.
export const runtimeTokens = {
  motion: {
    duration: { quick: 0.1, short: 0.14, response: 0.16, standard: 0.2, enter: 0.22, settle: 0.24, finish: 0.28, reviewComplete: 0.65, path: 0.72, loop: 1.4 },
    ease: { path: "power1.inOut", response: "power2.out", loop: "easeInOut" },
  },
  homeCopy: { exitSeconds: 0.18, enterSeconds: 0.42, staggerSeconds: 0.07 },
  buddy: { characterMs: 65, speechDelayMs: 650, copyIntervalMs: 6000 },
  icon: { animatedSize: 28, stroke: 2 },
  email: { codeSize: "28px", codeWeight: 700, codeTracking: "6px" },
} as const;
