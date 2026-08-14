# DESIGN.md — 吃透阅读 Web 产品规范

## 产品目标

帮助考研英语二考生通过历年真题做到两件事：看懂文章，做对题。

核心闭环：选真题 → 在线做题 → 提交 → 按文章复盘 → 间隔后完整重做。

## 信息架构

一级导航只有：

1. 刷题：题型、年份、文章状态、单篇练习与复盘。
2. 统计：跨文章聚合的练习量、正确率、重做效果、年份进度和练习日历。

单篇记录只属于文章，不在统计页展示练习流水。关键表达、关键句与错题是文章复盘的组成部分，不设置一级入口。

## 文章状态

`未开始 → 进行中 → 待复盘 → 复盘中 → 等待重做 → 可重做 → 已重做`

- 立即重做错题属于复盘验证，不生成新的有效成绩。
- 完整重做建议间隔 7 天；提前重做允许但不计入掌握结果。
- 完整重做时隐藏历史答案、解析、译文和标记。

## Reference lock

- Primary: Notion — warm paper notebook and document-database interface.
- Preserve: `#F6F5F4` paper canvas, white document surface, black text hierarchy built with opacity, flat hairline dividers, compact 4px-based rhythm and one Notion blue accent.
- Adaptation: use Notion's product-interface behavior rather than its marketing-page feature cards. The library is a document/database view: flat rows, column labels, quiet hover surfaces and compact selectors.
- Role rules: the clear blue `#3978F6` is the only chromatic action color and is reserved for the highest-priority action, current selection, focus and progress. Status remains understandable through text.
- Media strategy: pure product UI with Lucide icons; no photography, mascot or decorative illustration.
- Reject: gradients, glassmorphism, card grids for sequential content, drop shadows on content, cold blue-gray palettes, multiple semantic accent colors and oversized display typography.

## Design tokens

- Page canvas: `#F6F5F4`; sidebar: `#FCFCFC`; document surface: `#FFFFFF`; selected surface: `rgba(0,0,0,.06)`.
- Primary learning green: `#16875B`; green hover: `#10734C`; soft selected surface: `#EDF8F3`.
- Functional information blue: `#3478D4`, reserved for informational states such as "复盘中" rather than primary navigation or progress.
- Primary text: `#000000`; secondary text: `rgba(0,0,0,.60)`; muted text: `rgba(0,0,0,.40)`.
- Border: `rgba(0,0,0,.08)`; stronger divider: `rgba(0,0,0,.14)`; inverted surface: `#02093A`.
- Typography uses separate Chinese and Latin system-font fallbacks. On macOS, Chinese text prioritizes PingFang SC and Latin text uses the native San Francisco system font. On Windows, Chinese text prioritizes Microsoft YaHei and Latin text uses Segoe UI. Inter may be used as the cross-platform Latin fallback; do not load it when the native system font is available.
- Recommended CSS stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, "PingFang SC", "Microsoft YaHei", sans-serif`. Browser glyph fallback supplies PingFang SC or Microsoft YaHei for Chinese characters while preserving the platform-native Latin face.
- English exam passages use the same platform-native Latin stack instead of a separate serif face.
- Type scale: `12 / 14 / 16 / 20 / 24 / 36px`; `12px` is the minimum size allowed on web.
- Type roles: `12px` for compact metadata and helper text; `14px` and `16px` for body copy; `20px` for section and component titles; `24px` and `36px` for page-level and prominent large titles.
- The practice library opens with one editorial learning prompt above the question-type progress modules. Chinese uses `36/46px`; English may use `40/48px` to preserve comparable visual presence. Keep it text-only, max two lines of copy, with no banner, card, illustration or CTA duplication.
- Type weights: `12px` and `14px` prose uses regular (`400`). Navigation, button and compact UI labels may use medium (`500`) for legibility. Sizes `16px` and above support regular (`400`) and bold (`700`). Do not bold full paragraphs or use bold as the only hierarchy signal.
- Line-height scale: `12/18px` for metadata; `14/22px` for controls and list copy; `16/26px` for Chinese body copy; `16/30px` for English passages; `20/28px`, `24/34px` and `36/46px` for titles.
- Long-form text uses `text-wrap: pretty`; short page titles may use `text-wrap: balance`. Controls and compact metadata remain single-line unless specified otherwise.
- Spacing uses an 8px base with the practical scale `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px`.
- Radius scale: icons `4px`; compact selectors `6px`; buttons `8px`; independent cards `12px`; full pill radius is reserved for status tags and short values.
- Structure comes from the warm canvas, white cards, whitespace, alignment and `1px` stone borders.
- Default divider is `1px solid #E8E6E5`. Separate important regions with more whitespace rather than thicker or darker rules.
- Do not use gradients or glass effects. Pure white belongs to the document surface; the sidebar and outer canvas remain `#F6F5F4`.
- Elevation: no shadows on content. Use whitespace and hairline dividers; reserve shadows for overlays only.

## Component tokens

- Buttons use three heights: compact `40px`, standard `44px`, prominent `48px`. Icon-only controls use at least a `40 × 40px` hit area; no interactive target is smaller than `40px` in either dimension.
- Inputs and selectors use `40px` height by default and `44px` when they are the primary control on mobile.
- Lucide icon sizes are `16px` for compact UI, `20px` for primary actions and navigation, and up to `24px` for empty states. Use a consistent `1.75–2px` stroke; icons inherit the text or semantic status color.
- A page or distinct task region has one visually dominant primary action. Repeated article actions may use text buttons or restrained secondary buttons instead of a wall of equal blue buttons.
- Compact status tags combine color with text or an icon. Pills are reserved for status, filters and short selectable values, not general containers.
- Cards are used only when content needs an independent boundary or action context. Sequential article lists use flat rows and dividers.
- Question-type selectors combine navigation and progress in outlined modules: icon and type name, a subtitle showing the total number of practice units (articles for reading-like types and prompts for writing), deliberate flexible whitespace, then a bottom row with "已累计完成" and the completed/total value aligned to opposite edges above a thin progress bar. Never calculate progress from the number of questions contained inside an article.

## Component states

- Every interactive component defines: default, hover, pressed, focus-visible, selected, disabled, loading and error states where applicable.
- Hover may adjust border, text or surface color but cannot reveal essential information. Pressed feedback is visually stronger than hover and must not move surrounding layout.
- Keyboard focus uses `:focus-visible` with a `2px` primary-blue ring and `2px` offset. Compound controls use `:focus-within`. Never remove focus indication without an equivalent replacement.
- Selected state uses the selected blue surface plus text, icon, underline or another non-color cue. Selected and hover states must remain distinguishable.
- Disabled controls remove interactive feedback, use an explicit disabled cursor/state and remain readable; opacity alone must not be the only cue.
- Loading controls retain their original width, disable repeat submission and show a progress indicator with an accessible label.
- Errors appear next to the affected control or question, explain how to recover and receive focus or announcement after submission.

## Layout rules

- Persistent 224px desktop sidebar with only 刷题 and 统计.
- Desktop application shell uses a flat split layout: a fixed `#FCFCFC` sidebar separated by one vertical divider and a full-height white content area. Do not inset, round or frame the whole content area.
- The content area includes a compact 56px breadcrumb header separated by one bottom divider. A 40px account control sits with 8px vertical spacing. Library root shows "刷题"; deeper routes extend the same trail, for example "刷题 / 2023 / Text 1".
- Main content max width 1180px, centered with 32–40px horizontal padding.
- English passage measure is approximately `65–78ch`. In single-column review, passage width stays within `680–760px`; paragraph spacing is `20–24px`.
- Library: task summary → question-type tabs → year navigator → article status rows.
- Practice: exam header → passage and questions split 58/42 → sticky submit footer.
- Review: article remains the container; tabs separate 结果、文章复盘、练习记录.
- Statistics: aggregate only; no individual article feed.
- Desktop `≥1200px`: persistent 224px sidebar, full split layout and `40px` main-content gutters.
- Tablet `768–1199px`: compact navigation, `24px` gutters and a reduced split where space permits.
- Mobile `<768px`: navigation becomes a top bar, practice becomes one column and gutters reduce to `16px`.
- Compact mobile `<480px`: preserve `16px` gutters, stack secondary actions and avoid horizontal scrolling except for explicitly scrollable selectors such as the year navigator.
- Sticky actions respect safe-area insets on mobile and never obscure the active question or final paragraph.

## Interaction rules

- Article primary action changes with state: 开始练习 / 继续练习 / 开始复盘 / 继续复盘 / 查看复盘 / 完整重做.
- Practice supports timer, uncertainty marking, automatic local save and unanswered confirmation.
- Autosave exposes quiet states for saving, saved and offline. A temporary network failure must not discard local answers and must explain when synchronization will retry.
- Results first show score and next action, then explanations.
- Review prioritizes wrong and uncertain questions. Full paragraph translation is hidden by default and revealed per paragraph.
- Define explicit empty, initial loading, partial loading, load failure, offline, no-results and retry states for every data-bearing page. Preserve layout during loading to avoid visible jumps.
- Submission with unanswered questions requires confirmation and identifies the unanswered question numbers. Leaving an unsaved attempt requires a recovery warning.
- Use Lucide icons when available; do not hand-draw equivalent SVG icons.
- Motion is limited to `160–220ms` state feedback using `cubic-bezier(.2, 0, 0, 1)`. Animate opacity and transforms where possible; avoid layout-shifting motion.
- `prefers-reduced-motion: reduce` removes non-essential transitions, scrolling effects and decorative animation without hiding state changes.

## Accessibility

- WCAG AA contrast for text and controls.
- All interactions keyboard reachable with visible focus rings.
- Minimum interactive height 40px.
- Status never depends on color alone; always include text or icon.
- Semantic headings follow document order. Buttons perform actions, links navigate, and form controls have programmatic labels.
- Dynamic save, loading, submission and error feedback uses appropriate live-region announcements without repeatedly interrupting reading.
- At `200%` browser zoom, core reading, answering and submission flows remain usable without clipped content or two-dimensional page scrolling.

## Design QA

- Verify the library, practice, results, review and statistics pages at desktop, tablet and mobile breakpoints.
- Check typography against the defined size, weight and line-height roles; no rendered text may be smaller than `12px`.
- Check long English paragraphs at their maximum reading width and confirm that answer controls remain reachable without losing passage context.
- Confirm that white surfaces remain distinguishable through spacing and dividers, without reintroducing a gray page canvas, excessive cards or large shadows.
- Confirm that blue, green, amber and red retain their assigned semantic roles and that every status remains understandable without color.
- Test keyboard-only navigation, visible focus, unanswered submission, autosave recovery, offline handling, loading, empty and error states.
- Validate reduced motion, `200%` zoom, responsive reflow and mobile safe-area behavior before release.
