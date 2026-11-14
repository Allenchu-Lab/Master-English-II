# 吃透英语二：界面设计规范

本文件描述当前产品界面。所有页面、弹窗和后续组件都遵循同一套 token；局部需求不能再追加另一套颜色和尺寸。

## 产品与信息架构

面向考研英语二考生，核心闭环为选择真题、在线练习、提交、复盘、间隔后重做。

一级入口为刷题与统计。统计目前不可用，使用禁用态和 HeroUI Chip「Soon / 即将上线」标识。统计将展示聚合数据，不放单篇流水。

文章状态为未开始、进行中、待复盘、复盘中、等待重做、可重做、已重做。完整重做隐藏历史答案、解析和标记；立即重做错题不生成新的有效成绩。完整重做建议间隔七天。

## 当前设计方向与参考约束

- 中性白与浅灰白画布、白色内容卡片、明亮蓝色操作入口，平面、清楚、适合持续阅读。
- Apple Mac 页：借鉴克制的导航和中性表面，不照搬营销网站的大幅展示与整屏留白。https://www.apple.com/mac/
- Things（Refero）：借鉴中性表面与少量交互强调色，不引入倾斜卡片或产品展示阴影。https://styles.refero.design/style/ec0f5bca-8367-49e7-b8aa-73b3fa09a4a0
- Readwise（Refero）：借鉴阅读内容优先与强调色的用途约束。黄色用于划词标注，不作为页面主题。https://styles.refero.design/style/34c8dbee-f5d9-4495-a0e0-a25c6ca4b95b
- 保留顶部导航、居中内容、五题型卡片、左侧年份与右侧题目列表。
- 禁止内容和弹窗投影。顶栏允许中性半透明磨砂，不能将玻璃、光晕和渐变扩展至全部内容卡片。
- 图标来自 lucide-react；HeroUI 插槽也显式使用 Lucide 图标。动态图标按需使用已安装的 lucide-animated 组件，遵循减少动态效果偏好。

## Token 是唯一视觉值来源

浏览器CSS静态视觉值定义文件为 `src/styles/tokens.css`。`globals.css` 在 HeroUI 样式之后导入该文件。

三层职责：

1. 基础 token：颜色、字号、字重、行高、间距、尺寸与圆角等可复用值。
2. 语义 token：action、canvas、text、selection、progress、chart 等用途。HeroUI 的 accent、background、foreground、focus 及旧组件的 blue 等名称必须指向这些语义，不再各自定义主题色。
3. 组件 token：现有复杂布局、阴影、边框组合和动画参数。名称以组件或区域开头，在同一文件维护。迁移保留旧布局值以避免此次重构改变内页排版；保留值不代表新增组件应复制旧视觉。

### 当前关键语义

| 用途 | Token | 当前值 |
| --- | --- | --- |
| 页面画布 | `--color-canvas` | `#f5f5f7` |
| 白色内容表面 | `--color-surface` | `#ffffff` |
| 主要文字 | `--color-text` | `#1d1d1f` |
| 辅助文字 | `--color-text-muted` | `#626267` |
| 交互强调色 | `--color-action` | `#006fdf` |
| 强调色 hover | `--color-action-hover` | `#005bbb` |
| 强调色 pressed | `--color-action-pressed` | `#004993` |
| 题型选中底色 | `--color-selection` | `#f7fbff` |
| 选中 hover 底色 | `--color-selection-hover` | `#eff7ff` |
| 选中边框 | `--color-selection-border` | `#80b8f5` |
| 选中 hover 边框 | `--color-selection-border-hover` | `#4598f0` |
| 进度空轨道 | `--color-progress-track` | `#dfe3e8` |
| 图表序列 | `--chart-series-1` 至 `--chart-series-5` | 同一蓝色阶梯 |

错误、警示、完成状态保留各自语义，不能把全部状态都染成品牌蓝；必须配合文案或图标。

### 禁止硬编码

- 不允许在组件、CSS 声明或内联样式中写颜色、固定字号、间距、圆角、阴影、边框组合、静态尺寸等视觉常量。
- CSS 使用 `var(--token)`。要改变颜色/尺寸/状态，修改既有 token；缺少对应角色时先在 token 文件定义，再引用。
- 不以追加全局覆盖块作为新主题实现。已存在的兼容规则逐步合并，不能继续叠加历史主题。
- 不把一个新色值分散进多个近义 token；先确认是否应该复用语义。
- 图标尺寸用 token 支持的尺寸变体；SVG path、viewBox 和动画路径属于几何数据，不是设计 token。
- `display`、`flex-direction`、`auto`、`none` 等结构关键字可以直接使用。媒体查询断点属于响应式结构，CSS 原生媒体查询不能引用普通自定义属性，允许在查询条件中保留断点数值。
- 答题进度百分比、图表数值、浮层定位坐标及按运行时参数计算的尺寸允许动态内联；它们不能包含静态颜色或字体样式。图表的颜色仍须引用 token。
- GSAP 的时间轴编排与业务倒计时属于运行逻辑；新视觉动效的时长与缓动应复用 token，减少动态效果时关闭非必要动画。
- 第三方包内部样式不直接修改；通过公开 token、variant 和本地组件 token 对接。

## 首页组件规范

### 导航

顶栏 Logo 左侧、刷题和统计整体居中、语言与账户右侧。内容最大宽度维持现有 1120px，并与导航内容边缘对齐。

菜单只使用文字。当前页以较深文字及字重区分，不使用额外短横线。语言入口是纯 Lucide 图标，点击打开 HeroUI Dropdown；English 与简体中文中只能有一个 Lucide Check。选择后关闭并持久化语言。

按用户偏好，顶栏没有外圈或点击后残留的填充；hover 提供轻微底色变化。仍须验证键盘可达和当前状态可辨识，不能以隐藏焦点解决其他区域的键盘问题。

### 题型卡片

使用 HeroUI Card，整卡点击切换，没有内嵌选择按钮。保留 radio 语义、方向键、Home/End、Enter/Space。

图标、粗体标题和说明左对齐；完成说明靠左、计数靠右、进度条在底部。选中时细蓝边框、极浅蓝底和蓝色标题，不加勾选角标。hover 不能吞掉进度轨道。零进度显示空轨道，不能伪造已完成部分。

首页各模块的 hover 反馈统一为题型卡片的模式：未选中项悬停显示浅灰底（--home-hover-surface，即 #fafafa）、边框保持透明、背景与边框 150ms 过渡；已选中的题型卡片保留浅蓝选中 hover。任务卡片、年份按钮与“我的表达”入口都遵循该规则。

桌面五列，平板三列，手机横向滑动。年份保留原有选择逻辑，手机横向滑动。“我的表达”使用整卡链接。

介绍区插图位于右侧，与题型模块右边缘对齐；手机隐藏。主内容宽度和现有整体结构保持稳定。

### 字体与响应式

系统字体为主，中文保留平台字体回退；英文试题正文保留既有阅读字体用途。介绍标题与正文、辅助信息分层，不将所有文字都加粗。

主要内容边距沿用桌面48、平板24、手机16的 token 值。手机断点为767px，题型网格断点为1100px；不得独立引入冲突断点。

## 登录与通用交互

使用 HeroUI Modal、Input、Button，标题和图标有明确层级。输入框聚焦使用单层等宽边框，不叠加错位外轮廓。字段错误靠近字段，服务错误靠近对应操作；不能将网络或服务失败误报为验证码错误。

交互组件应定义适用的默认、hover、pressed、focus、selected、disabled、loading 与 error 状态。加载和错误反馈不得让布局跳动，不用颜色独自传达状态。

## 内页与验收范围

阅读、阅读B、完形、翻译、写作、精读和我的表达共用上述 token；本次 token 迁移不代表内页已逐页完成视觉重设计和验收。

答题必须保留计时、自动保存、未答确认与恢复能力。提交后优先显示成绩和下一步，复盘优先错题和不确定题。中文、英文、未登录、已登录和长内容状态都应检查。

修改后的必需检查：

- `npm run check:tokens`：检查本地 CSS 和组件中的硬编码视觉值。
- `npm run verify`：包含 token 检查、lint、生产构建。
- 对受影响的页面做桌面、平板、手机及相关交互状态的实际视觉检查。
- 文本对比度满足WCAG AA；检查键盘、减少动态效果、200%缩放与移动端安全区。
- 优先使用内置浏览器，避免独立 Chrome 在 Dock 留下最近应用。临时测试必须结束自己的进程，不影响用户浏览器。

## 五题型练习页样式（本次同步）

五题型通过 `--practice-*` 共享阅读/作答表面、边界、选项、控件与反馈样式：阅读区白色，作答区浅灰白；蓝色只表示操作和选择，绿色表示正确，红色表示错误。阅读A选项、阅读B匹配/判断/标题选择、完形题号与选项、翻译评分与原文折叠区、写作编辑及评分区沿用这一套角色。主控件统一40px高度、12px圆角；手机沿用16px横向内边距。

此次已通过 token、lint、构建与接口回归；内置浏览器连接超时，登录后的逐页视觉与提交/复盘状态检查仍待完成。不能将源码样式同步等同于完整视觉验收。

## 练习页组件映射

| 场景 | 组件 |
| --- | --- |
| 阅读A、阅读B共享选项与判断、完形选项 | PracticeChoice → HeroUI Checkbox / Checkbox.Content |
| 阅读B小标题下拉 | PracticeSelect → HeroUI Select / ListBox |
| 翻译、写作及书信正文编辑 | HeroUI TextArea |
| 阅读A作答进度、精读解析进度 | PracticeProgress → HeroUI ProgressBar |
| 五题型未答确认与重做确认 | PracticeDialog → HeroUI Modal |
| 阅读B、完形加载失败提示 | PracticeNotice → HeroUI Alert + Lucide AlertCircle |

选项使用 Checkbox 机制是为了保留当前再次点击可清空的行为，每题是否允许多个答案仍由原有单值答案逻辑控制。不可直接换成无法清空的 Radio 而改变作答行为。题号定位和返回操作仍使用 Button/Link，不将动作组件强行改为选择组件。小标题下拉保留清空入口和已占用选项禁用规则。

本轮组件迁移已通过 token、lint、生产构建、页面冒烟和登录权限接口回归；内置浏览器持续连接超时，键盘、弹窗焦点恢复、选项清空和移动端实际渲染仍需浏览器验收。接口测试不能证明这些UI行为。

## 组件残留清理

评分档位、目标档位、扣分类别、翻译状态及首页题目状态统一使用 PracticeBadge → HeroUI Chip；书信称呼、结束语和署名统一使用 HeroUI Input。题号、段落编号、Directions 和说明性小标题属于普通排版，不为“组件覆盖率”强行改成标签。正文划词 mark 保留语义。

清理了153条已确认无组件使用的旧选择器分支（旧侧栏、登录弹窗、题型选择器及原生弹窗背景）和62个不可达组件 token；共享基础 token 保留。迁移后的标签统一使用 token 字号，不继承旧目标档位9px的样式。仍需实际浏览器核对长文案、已提交状态和标签换行。

## 首页题目入口的统一布局

五题型题目卡片使用同一标题／状态／操作三列：标题与题量居左，状态及成绩居中，操作居右；移动端标题占首行，状态与操作并排。高度、内边距、列宽与圆角只通过 `--library-task-*` 调整。不展示Source或PDF页码来源；已提交卡片保留完成时间和成绩。状态保留无圆点的Chip。

## LibraryTaskCard redesign (supersedes the three-column layout above)

Reference: Quizlet Study Set Card, https://styles.refero.design/style/528eb1d4-8508-4dc6-87b4-c7b92d648dac . Adapt its study-set title/metadata hierarchy and white surface; omit its violet branding, colorful feature panels and shadows. Things supplies the bounded secondary reference for neutral surfaces and sparse accent use.

All five question types now share LibraryTaskCard, built on HeroUI Card. Desktop: title and study volume on the left, status/score above actions on the right. Mobile: summary first, then status and action side by side. No Source text. Use --task-card-* tokens for geometry and existing semantic tokens for color. Preserve the user's bright blue, white cards and no-shadow requirements.

Validation: token check, lint, production build and page smoke passed. The built-in browser connection timed out; rendered visual QA remains outstanding. No standalone Chrome was launched.

### LibraryTaskCard alignment refinement

Latest approved layout: title, status Chip, score and completion time form the same inline information row; study volume is below. The action area remains vertically centered on the right in every state. Long metadata may wrap; it must not push the action to the bottom. Mobile keeps the same information/action relationship. This supersedes the earlier status-above-action arrangement.

Latest result placement: score and completion time use a separate centered result slot. Title and status remain together at the left; actions remain vertically centered at the right. Desktop uses symmetric outer columns to keep the result centered independently of action width. This supersedes inline score/time placement.

## Unified post-submission actions

All five practice types use AnswerActions after submission: Back to library, Redo, and Review answers (Reading A instead exposes Intensive reading). The action bar stays at the bottom and the layout reserves space for it; mobile retains safe-area padding. Hide duplicate header redo controls after submission.

Completed library cards expose Redo as well as their review action. For Reading B, Cloze, Translation and Writing, `redo=1` opens the existing confirmation only after the submitted attempt loads. Navigation itself must never create or clear an attempt. Remove the parameter after handling so refresh does not reopen confirmation. Confirmed redo uses the existing mutation handler and preserves past submissions. Reading A retains its established redo route behavior.

### Reading A/B action placement (latest override)

Reading A restores its original local footer inside the question pane; do not use the viewport-wide AnswerActions bar for it. Reading B follows the same split-pane structure and local footer: independently scrolling answer content, result summary left and Back to library / Redo / Review answers right. Reading A retains Intensive reading as its third action; Reading B uses its existing review content rather than inventing an intensive-reading route. Submitted headers show Submitted instead of a duplicate redo button. Other question types retain AnswerActions for now.

Cloze now follows the Reading A/B local answer-pane footer as well, replacing its viewport-wide bar. Header shows Submitted after grading; the local footer exposes score, Back to library, Redo and Review answers. Translation and Writing still use the full-width bar.

Review readability: submitted choice controls remain read-only but must keep full text opacity. Disabled appearance is for unavailable exam actions, not review content. Reading B separates the user's answer and correct answer using a wrapping comparison row; evidence and explanation use distinct headings and a white content surface.

Writing Part A/B navigation uses controlled HeroUI Tabs, List, Tab, Indicator and Panel. Selection delegates to the existing async navigate handler so saving completes before the active task changes. Loading, navigating, submitting and rewriting disable switching. Do not restore the old custom button/tab CSS.

## Writing and translation analysis readability

Analysis captions use --analysis-caption-size (13px), prose --analysis-body-size (14px), and reading passages --analysis-passage-size (16px). Use --analysis-body-leading for readable explanations. Writing score cards collapse to one column on narrow screens; section headers and expression actions wrap. Shared white surfaces, hairline boundaries and no shadows apply to both analyses.

Writing explicitly explains empty deduction/expression lists rather than showing blank sections. Translation uses controlled HeroUI Tabs for feedback/reference/notes, preserving panel state and existing review data. Style work must not change grading, resubmission or expression-saving behavior.

Local simulations were regenerated from current review JSX and compiled CSS. Token checks, lint, build, translation-review/rubric tests and page smoke passed. Actual browser visual/interaction QA remains pending because the built-in browser connection is unavailable.

Writing now also follows the Reading-style local footer inside the answer/review pane. Remove the inline rewrite action and the viewport-wide bar. Keep score left and Back to library / Redo / Review answers right, using practice-submit. Confirm redo with the existing preservation flow. Translation alone retains AnswerActions until explicitly changed.

Writing analysis footer now exposes only Back to library and secondary outlined Redo. Remove Review answers because the analysis is already displayed in the pane. Do not promote Redo to a blue primary through generic practice-submit styling; reading footers also preserve Redo as secondary.

Writing footer priority correction: Back to library remains secondary outlined; Redo is the single blue primary action. Review answers remains removed. This supersedes the earlier secondary-Redo instruction for Writing only.

## Control shape (current)

Buttons and action links use --radius-control; tags use --radius-tag; segmented Tabs use --radius-tabs-track and --radius-tabs-selection for both the track and selected segment. These aliases share a capsule radius. Card, modal, option-card and text-input radii remain independent. Do not change --practice-radius globally to make buttons rounded, because it also controls content surfaces.


## JS和邮件token补充

`src/styles/runtime-tokens.ts`集中维护JS动画库需要的数值时长/缓动、动态图标默认尺寸/描边，以及邮件模板排版。邮件不能继承浏览器CSS变量，所以不在模板内硬编码排版。后台图表最小列宽和最小可见柱高也引用CSS token。检查脚本扫描全部src中的TS/TSX，新增检查数值动画时长、字面缓动和px/rem等尺寸字符串；token定义文件本身允许定义值。SVG路径、图片原始宽高、业务时间、进度比例和坐标属于数据，不作为主题样式常量迁移。

## AI 批阅等待态

写作与翻译共用 `ReviewProgress`，使用 HeroUI ProgressBar 的确定进度模式。接口按 NDJSON 流回传读取作答、AI 分析、校验、保存四步的真实阶段，条形按完成步骤数推进，文案显示步骤而非模型生成百分比。禁止按时间伪造进度；重试不倒退，保存成功才完成。蓝色填充与灰色轨道复用现有语义 token；遵循组件的减少动态效果支持。等待结束后替换为结果或重试状态。视觉沿用 Apple 的中性表面与 Google for Education 的清晰教育产品层级（Refero），不引入营销背景与阴影。

翻译与写作结果页操作栏均位于右侧编辑/批阅栏内，不跨原文栏，不使用通栏固定底栏。

## 练习底部业务组件

五题型和阅读精读统一使用 `PracticeActionBar`，放在各自右侧答题/批阅栏内部。作答中和完成后共用布局：左侧 summary（得分、保存提示或错误），右侧 actions。操作以稳定 id、文案、primary/secondary、链接或回调、禁用/忙碌状态声明；路由、重做确认与提交业务仍由页面负责。按钮基于 HeroUI Button，导航链接复用官方 buttonVariants。题型不能追加专属底栏样式；高度、边距、背景、分隔线、折行及移动端吸底都由共享样式与 token 管理。当前阅读类的主操作为精读/复盘，写作翻译为重新练习；每组至多一个主操作。

逐段精读初次生成与重新生成同样使用 `ReviewProgress`，进度按段落独立保存，切换段落不串进度。基础元素的继承颜色置于 CSS base layer，禁止用未分层的通用 button/a 颜色覆盖 HeroUI 组件颜色。

二级按钮保留 HeroUI secondary 的中性背景和交互，文字通过 `--color-action-secondary-text` 映射到主文字色，不使用默认 accent-soft-foreground 蓝字。按钮与 buttonVariants 生成的导航链接遵循同一规则。

五题型作答阶段的提交操作统一位于顶部 practice-header-actions；写作与翻译底部仅保留保存状态及错误提示，完成后的复盘操作仍位于右侧底栏。

写作与翻译作答阶段的底部提示使用 `DraftStatus`，复用阅读 B / 完型的 reading-b-save 字号、颜色和行高；不带分隔线或操作栏最小高度，保留保存失败与字数不足提示。

五题型统一复用 DraftStatus 保存提示：灰色小字、白色背景、无分隔线，中文统一为“草稿自动保存”。阅读 A 根据请求状态显示读取中、保存中及保存失败；预览模式不展示已保存提示。

AI 真实阶段进度在等待时保持当前值，蓝色已完成段内部显示轻柔流动光带，表达请求仍在处理，不代表额外进度。光带仅在 aria-busy=true 时存在，完成后消失；减少动态效果模式关闭。颜色、渐变与动效参数全部定义在 review-progress-wave tokens。

AI 等待态不展示步骤计数，避免让用户误以为阶段等时。真实完成后进度条先走满，保留短暂完成反馈再切入结果；时长引用 runtimeTokens，减少动态效果时跳过停留。

阅读 B 提交后直接展示选项复盘，底栏仅保留返回首页（二级）和重新练习（主按钮），不再提供查看复盘。阅读 B、完型提交后不显示“按参考答案判分”提示栏。

翻译批阅沿用写作批阅的灰色画布和白色分块：得分、原文折叠区、各失分条目、参考译文及句式词汇卡片复用 analysis-card 的边框、圆角和间距。作答区白底规则仅作用于未提交状态，不覆盖结果画布。

写作与翻译的评分统一使用 ReviewScore，原文折叠统一使用 ReviewOriginal。评分不使用固定窄列：分数和总分可换行、档位可折行，分数字号通过 review-score token 统一管理；写作特有的升档建议作为可选内容，不复制评分布局。

写作和翻译批阅统一采用“评分 → 我的作答 → 详细批阅”顺序，容器共用宽度、内边距及卡片间距，避免同一 ReviewScore 被页面外围样式呈现为不同模块。

评分卡内的升档建议采用白底、细分隔线、灰色小标题和正文，不使用嵌套胶囊底色；通过间距与行高建立层级。

升档建议使用 PracticeBadge 暖黄色高亮标签，颜色由 review-advice 语义 token 管理，仅用于改进建议提示。档位文案统一为“第 N 档”。

批阅完成态不显示独立顶部标题栏和字数；“批阅和复盘”作为滚动内容内的单一标题，写作与翻译保持一致，不固钉。作答阶段仍保留字数反馈。

批阅标题与内容卡片共用容器宽度和左右边缘，标题至首张卡片间距为 16px，由 review 标题及内容 padding tokens 管理。

“批阅和复盘”作为页面标题，字号 24px、字重 700、行高 32px，统一引用 review-title 排版 tokens。

翻译批阅 Tab 轨道通过 analysis-tabs-track-surface 使用深一档的中性灰，与灰色画布拉开对比，选中项保持白色；组件统一交互和几何，背景根据承载表面适配，不强制套用写作任务 Tab 的底色。

主按钮与任务/批阅 Tab 选中块试用清透微立体材质：蓝色轻渐变或乳白轻渐变、细边缘、顶部内高光，仅用 inset 阴影，不增加外投影。hover 提亮、按下减弱高光，保留原有禁用态、焦点与大圆角；材质统一由 control-glass tokens 管理。

二级按钮采用中性浅灰微渐变、细边缘和轻内高光，与主按钮共用材质语言；文字保持深灰，hover 轻微加深、按下减弱高光。参数统一引用 control-glass-secondary tokens，组件按钮和导航链接同步适用。

写作任务 Tab 与翻译批阅 Tab 共用 analysis-tabs-track-surface 中性灰轨道，选中块共用乳白微立体材质。

写作与翻译 Tab 的未选中 hover 共用规则：文字由辅助灰加深至正文色，透明度保持 1，兼容原生 hover 和组件 data-hovered，不使用淡出反馈。

所有练习主分栏（阅读 A、阅读 B、完型、翻译、写作、逐段精读）统一左右各 50%，通过 practice-split-columns token 管理。手机端保留原有上下堆叠；卡片内部字段布局不受主分栏比例影响。

保存提示位于滚动内容末尾，透明底、无独立底栏、不固定；跟随页面画布。阅读 A 的解析背景复用 practice-canvas。

逐段精读右侧复用 practice-canvas 灰色画布和 analysis-card 白色模块体系，段意、参考译文、长难句、词汇、命题提示分别成块。移除旧的绿色提示底，引用使用中性灰底；沿用统一边框、圆角、卡片间距 token。

题型选择卡片沿用按钮的清透微立体语言，以 topic-material tokens 管理乳白微渐变、细边缘与内高光；选中保持浅蓝表面和蓝边框，不增加外阴影，不改变进度轨道对比与整卡交互。

单词查词 hover 使用动态细下划线，移入展开、移出收回，取消胶囊底色；词典打开时保留下划线，减少动态效果时禁用过渡，不改变划词 mark。

首页画布试用自下而上的淡蓝渐变，顶部保持浅灰白，底部淡蓝，按视口固定铺开；仅作用于 library，内容容器透明、卡片保持原有表面。颜色、渐变位置与尺寸由 home-canvas tokens 管理。

首页背景改为底部不对称弥散渐变：左侧淡蓝、右侧淡青，椭圆色雾向上自然淡出，不设动画，不影响卡片表面。参数由 home-diffuse 与 home-canvas tokens 管理。

首页恢复纯色 canvas，取消弥散渐变。顶部导航采用更高不透明度的白色表面，保留原有 backdrop 模糊材质，使导航和浅灰内容画布边界更清晰。

首页介绍区缩短最小高度并垂直居中，减少导航下的空白。导航当前项采用浅蓝中性胶囊、蓝色文字与轻内高光，不加外圈或下划线；颜色引用 home-nav-selected tokens。

首页上半部使用 home-paper-study.webp 装饰背景：浅纸纹、右侧书页铅笔线稿、左侧留白，底部通过 home-paper tokens 淡出至 canvas。仅加载一次 WebP，不加动画，替代原有首页小插图；小屏关闭背景装饰以保证可读性。

首页背景图片横向覆盖整个画布宽度，避免固定图片宽度造成两侧拼接边缘；内容仍保持既定居中宽度，背景在 440px 内淡出。

首页背景当前采用 home-study-lines.webp：浅蓝灰抽象细线向上舒展，表达考研积累与突破，不使用具象海岸。保留左侧留白、全宽铺图与下缘淡出。

首页线条背景适配大屏时右上对齐、等比缩放、最大宽度 1920px；超宽区域使用 canvas 衔接，图片左右与下缘淡出，内容容器宽度独立。

首页恢复纯色背景，右侧使用修正四肢后的 study-buddy-kitten-v2.webp 小猫 IP 静态图，桌面144px、小屏88px；后续动态由独立角色素材接入。

首页小猫左侧配淡暖白对话气泡，作为简短陪伴文案，使用 home-buddy-speech tokens；不增加外阴影，小屏允许介绍区折行。中英文文案对应展示。

小猫气泡采用不规则椭圆轮廓与朝向角色的尾部，首次挂载柔和展开，文字随后淡入；减少动态效果时直接显示。角色脚下允许专属接地软阴影，独立于禁止卡片外投影的规则，全部由 buddy tokens 管理。

气泡参考 Refero Duolingo welcome（a6439332-6945-4ca3-ad43-f4cedabd80a2）的角色连接关系，保持本产品浅色风格：柔和不对称圆角、指向小猫的短曲尾，避免夸张椭圆。BuddySpeech 逐字显示一句话，预留全文高度避免布局跳动；完成后停止并去掉光标，减少动态效果时直接展示全文，辅助技术读取完整句子，卸载时清理计时器。

气泡装饰轮廓使用单一闭合矢量路径，主体和尾巴统一填充/描边，禁用独立色块拼接尾巴，缩放保持描边宽度不变。它是装饰背景，不属于标准控件图标。

首页介绍使用 HomeIntro 配套文案组（标题、副标题和小猫台词），每次访问按 sessionStorage 顺序进入下一组，停留时每16秒循环，页面不可见时不推进；减少动态效果时停止自动轮播。气泡宽190px、内边距14px 22px，逐字展示后静置。中文标题使用本地霞鹜文楷 Medium 子集（仅包含文案组标题字形），OFL许可证随字体保留；新增标题需同步更新子集。字体大小与界面正文保持既有层级，不把标题字体用于正文控件。

中文首页标题取消文楷，改用现代系统黑体（优先苹方），600字重与轻收紧字距，参数引用 home-title tokens。

字体统一跟随设备默认系统字体：所有界面、标题和阅读字体角色均映射 font-ui（system-ui），不加载独立字体或指定装饰字体。字号、字重及间距继续通过 token 建立层级。

首页继续练习入口使用 ResumePractice 业务组件，基于 HeroUI Link 与 Lucide ArrowRight：深色胶囊、蓝色圆箭头、标题和副信息。按五题型服务端最近保存时间选取有实际作答且未提交的草稿，无草稿或未登录时隐藏。入口独立于首页文案轮播；字体、颜色、尺寸由 resume tokens 管理。阅读 A 新增 updated_at 保存时间字段（024迁移），旧记录无法还原历史修改时间。

继续练习入口改为单行紧凑胶囊：圆箭头、继续、题型/题目/年份横排，副信息超长时省略。

继续练习深色胶囊采用 resume-material 微渐变、细边缘和内高光；hover 提亮、按下减弱高光，保留紧凑横排和蓝色箭头，不增加外投影。

首页导航统一高度56px，内容顶部补偿80px，保留24px呼吸空间。页脚位于列表末尾，细分隔线、产品名与介绍、现有版权备案信息，手机端自然换行，不固定。

## 首页导航与页脚（Refero 参考重设计）

方向锁定 Things 的系统字体、中性白灰与少量蓝色强调；借鉴 Shuttle 的紧凑导航密度和 Pop Site 页脚的品牌/导航/合规信息分层。参考：https://styles.refero.design/style/0796cd74-edc2-4e12-9c71-25fac02a1cb2 、https://styles.refero.design/style/6285d741-d05c-4a28-aa86-6ca900dde2f8 、https://refero.design/pages/a057ecad-e1f5-46ca-9c65-904417cc893f 。

56px白色磨砂顶栏保留：中间轻灰分组轨道、白色蓝字当前项，左右为品牌与工具；账号仅显示邮箱用户名，完整邮箱在账户弹窗与 title 中保留。小屏账号入口保留图标与可访问名称。页脚复用 SiteFooter 业务组件，品牌和有效学习入口在上层，版权备案在底层，链接均指向已存在内容。返回顶部滚动首页内容容器，减少动态效果时立即返回。不引入外投影和多栏营销页脚。

页脚精简为单行品牌/介绍、版权备案与返回顶部，删除真题练习和我的表达入口；顶部细分隔线横贯视口，内容继续居中，小屏自然折行。

首页内容容器采用纵向 flex，页脚 auto 顶部外边距将短页面页脚推至视口底部，长页面随内容滚动；底部仅留12px安全空间。返回顶部使用透明文字式按钮，hover 只变色，不出现默认灰色胶囊底。


## 我的表达收藏页

延续本站中性画布、白色内容表面与系统字体。参考 Readwise 的阅读层级（https://styles.refero.design/style/c848b5d7-c7e8-4c76-85d3-6c91cbaa1c42），借鉴 Literal 收藏页的聚焦单列结构（https://refero.design/pages/279e9e16-453f-4b13-b3a3-b10e707c596a）；不引入其绿色品牌色、衬线字体或营销页大留白。

- 顶部只保留“返回写作”和收藏数量；“我的表达”仅在内容区作为一级标题出现，避免重复图标与标题。
- 收藏按真题年份从新到旧分组，组内保留收藏时间倒序。年份使用分组标题，每年共用一块白色列表表面。参考 Superlist 阅读列表的分组（https://refero.design/pages/714507ca-404e-4763-8c5f-6f9cce58a0e4）与 Memotron 的细线分隔行（https://refero.design/pages/64bb5d51-95c7-4847-bac8-9a1c3ac85b5a）。
- 收藏页在视口内纵向滚动，顶部返回入口与收藏总数保持可见。条目使用原生 details/summary，默认收起且一次展开一条。摘要最多两行，显示优化表达、Part A/B 标签和展开箭头。展开后显示完整对照、可迁移句型及适用场景。空状态使用 HeroUI Card；题型、数量和适用场景复用 PracticeBadge（HeroUI Chip），错误复用 PracticeNotice（HeroUI Alert）。
- 取消保存位于展开区内，使用统一 secondary Button，空状态去写作使用 primary 链接按钮；沿用清透微立体按钮，不给内容卡增加投影。
- 原表达和优化表达桌面各占 50%，手机上下排列；优化表达用较高字重，原表达保持完整可读，不加整段删除线。
- 可迁移句型放浅灰圆角分块，标签允许换行；标题、正文和辅助文字沿用现有字号层级。
- 样式值均来自 expressions 组件 token 或现有语义 token。加载失败提供重新加载，不同时显示“无收藏”。


### 首页间距节奏

首页模块之间由 `.library` 的 row-gap 单点管理：桌面 24px，手机 16px（home-section token）。介绍区、题型区、可选的“我的表达”和年份题目区不再叠加各自的上下 margin；有无收藏入口时保持相同节奏。题型卡片横向间距使用 home-item-gap（12px）。导航覆盖区由导航高度加模块间距计算，避免调整导航高度后留白失衡。页脚保留自动贴底，长页面与上一模块至少保持一个模块间距。


### 首页“我的表达”入口

参考 Clearful 收藏行（https://refero.design/pages/07f01ebe-d38f-472d-9831-82402f08ce08）的图标—名称—导航箭头结构，借鉴 Hashnode 书签页（https://refero.design/pages/09eba739-30cf-41d2-a8ac-a976f24cd05a）的标题与说明层级。本站白色 Card 和蓝色交互体系为主，不引入参考的深色画布。

入口继续使用 HeroUI Card 整卡链接；左侧 HeroUI Surface 是装饰性浅蓝底座，44px、14px 圆角，Lucide BookMarked 为24px，无独立点击行为。中间标题16px/600、说明13px/20px行高，两者间4px，文字组左对齐并与图标整体垂直居中。右侧18px灰色箭头降低权重，窄屏说明自然换行；不截断主要信息。不新增外投影，内高光复用现有控件材质 token。


### 顶部主导航交互

顶部是页面级导航，使用 nav 语义。“刷题”使用 Next Link 配合 HeroUI buttonVariants 的胶囊样式，并以 aria-current 标记当前页；统计未开放时仍用禁用 HeroUI Button 和 Chip。保留中性分段底座、白色清透选中项及蓝色文字，选中/hover/禁用/键盘焦点在同一组样式中维护，不追加互相覆盖的旧状态规则。键盘焦点通过内侧蓝线呈现，不在普通点击后保留外圈。

Soon / 即将上线继续使用 HeroUI Chip：白色底座、清晰的中灰文字、11px/600 和胶囊圆角。禁用导航不再对整个控件降低透明度，避免连同说明标签一起变淡；“统计”仍保持禁用语义和辅助文字色。


### 写作批阅间距

写作批阅使用统一模块节奏：桌面模块间20px，卡片内边距20px，手机均为16px；扣分项与表达条目内部间距12px。标题组与说明上下排列，8px分隔，避免在半屏宽度内横向挤压。提分版本、扣分条目、表达条目、评分及我的作答共享相同内边距 token。批阅内容底部留24px，底部操作栏独立布局，不再预留大段防遮挡空白。共用“我的作答”展开内容与摘要间16px，去掉嵌套段落和信件末尾的重复留白。


### 批阅的亲密性与共同区域

评分、我的作答、Tab 批阅区域是不同模块，之间使用模块级间距；失分数量、整体分档说明和失分内容共同归属“失分批阅”Panel，不在作答卡片与 Tabs 之间游离。Tab 已提供标题时不再重复同名大标题。Panel 内说明组8px、说明组到内容卡16px，失分内容卡之间16px，以近距离表达关联、以模块距离表达层级。

练习确认弹窗的主/次操作必须显式传入 Button 的 primary/secondary variant，统一使用现有清透材质 token；局部弹窗 CSS 只负责布局与尺寸，不用 background 简写覆盖按钮渐变。引导弹窗主按钮同样遵循此约定，关闭按钮保留 ghost。

弹窗标题使用统一 dialog-title-weight（700）：练习确认标题使用 HeroUI Modal.Heading（通过 PracticeDialogTitle 导出），保持20px/28px；登录标题保持24px并加粗。标题不靠增大空白来建立层级。


### 首页文案轮换动效

参考 Linear / Raycast 的紧凑标题层级（https://styles.refero.design/style/554b801c-3b31-4086-a7e5-ae613cdd618b、https://styles.refero.design/style/e5a749d7-9f71-4b52-9f50-24b243396034），仅借鉴排版克制，不引入深色背景。轮换运动参考 Motion 的文字揭示思路（https://motion.dev/examples/js-text-reveal），本站用现有 GSAP 实现，不新增动效依赖。

标题与副标题整体轻微上移、淡出（180ms），新文案从下方8px进入（420ms），两行错开70ms；不逐字拆散主标题。完整展示后停留6秒再换下一组。小猫接话在标题进入完成后开始，气泡外框保持原位，不随每轮重新弹出。JS时长使用 runtimeTokens，位移使用 CSS token。

所有文案叠在相同网格位置预留最大高度；不可见文案 aria-hidden 和 inert，保留一个可读标题。不显示暂停入口；悬停、键盘焦点、页面后台和介绍区离开视口时停止自动推进；减少动态效果时固定展示完整文案。切换语言保留当前组别，组件卸载清理所有定时器、观察器、媒体监听和 GSAP 动画。

### 账户弹窗与精读信息去重

账户弹窗的发送验证码、验证登录沿用 primary 微立体材质；更换邮箱使用 secondary；退出登录保留 danger-soft 语义，并由共享 control-glass-danger-soft tokens 提供轻渐变、细边缘和内高光。禁止为弹窗另写扁平背景覆盖。

精读右栏取消顶部「段落解析／已解析数量」进度栏，仅保留底部当前段落计数与翻页操作；单段 AI 请求过程仍使用 ReviewProgress。右栏使用内容区与底部操作区两行布局，不能留下原三行网格的空行。
