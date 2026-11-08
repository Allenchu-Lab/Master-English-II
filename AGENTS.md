<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI icon conventions

- Use `lucide-react` from https://github.com/lucide-icons/lucide for interface icons. Prefer named imports; do not draw replacement SVG icons or mix icon libraries for standard controls.
- Supply Lucide icons explicitly to HeroUI slots when the component permits it (for example, `Check` in the language dropdown selection indicator).
- For animated icons, use components from `@lucide-animated` on demand. Preserve existing HeroUI components and design tokens; adding an icon must not replace the UI framework or reset global styles.
- Keep icon size and stroke consistent, give icon-only controls accessible names, and respect reduced-motion preferences for animation.

## Browser verification cleanup

- The user should never need to manually close test Chrome processes. Run browser checks serially, await each script's exit, and verify its dedicated Chrome PID and descendants have exited before completing the task.
- On failure or interruption, clean up only the test process tree identified by its dedicated PID/profile. Never terminate the user's regular Chrome instance or use a blanket kill command.
- Prefer the built-in browser for UI verification. Do not repeatedly launch standalone Chrome for routine screenshots: even after exit, macOS may leave recent-app entries in the Dock. The user explicitly wants to avoid these entries.

## Design system consistency

- Read DESIGN.md before any UI work. src/styles/tokens.css is the only source of static visual values.
- Do not hardcode colors, sizes, spacing, typography, borders, shadows or state styling in components or stylesheet declarations. Adjust existing semantic/component tokens first; add a named token only for a new role.
- Preserve the documented exceptions for runtime data/geometry and media-query breakpoints. Do not edit third-party packages.
- Run npm run check:tokens with UI changes. Keep DESIGN.md and token semantics synchronized with approved design decisions.
