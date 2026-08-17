-- 本文件由 scripts/build-answer-keys.mjs 生成，请勿手工编辑。
-- 修改答案请编辑 content/answer-keys/<年份>.json 后重新生成。
begin;

-- 2025 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 1, '根据第 1 段，美国的小费习惯____', '["被视为慷慨的象征","被认为对服务员不可或缺","是奖励勤勉的一种方式","在多数商家属于可选项"]'::jsonb, '第 1 段说，过去美国顾客给小费的对象是那些收入主要来自小费的人，例如时薪低于最低工资标准的餐厅服务员。可见小费是服务员收入中不可或缺的部分，因此选 B。A 项“慷慨的象征”原文未提；C 项原文奖励的是优质服务而非勤勉；D 项与原文相反，过去只有特定服务才给小费。'),
  (22, 2, '与过去的小费相比，如今的小费____', '["支付频率大幅降低","更少被预先索要","与服务质量的关联更弱","对劳动者收入的贡献更小"]'::jsonb, '末段指出，如今的小费更具强迫性、更少出于慷慨，并且常常与服务质量完全脱钩，因此选 C。A 项支付频率其实在上升；B 项与原文相反，预先索要小费正变得更常见；D 项原文说小费进一步补充了低薪服务者的收入。'),
  (23, 0, '小费请求蔓延到新的服务类型，原因是____', '["技术的进步","增加收入的意愿","商业形态的多元化","小费膨胀的出现"]'::jsonb, '第 4 段说数字支付设备的普及让索要小费变得更容易，这解释了小费请求为何蔓延到新的服务类型，因此选 A。B 项增加收入是雇主的动机，不是蔓延的直接原因；D 项 tipflation 是这一现象的名称，不是成因。'),
  (24, 3, '取消小费的运动，其意图是____', '["促进消费","丰富收入来源","维持合理价格","保障收入公平"]'::jsonb, '原文说，为确保所有员工都获得公平薪酬，一些餐厅取消小费并提高菜价。小费主要惠及服务员，厨师和洗碗工却分不到，因此该运动的初衷是保障收入公平，选 D。C 项与原文相反，这些餐厅其实提高了价格。'),
  (25, 0, '从末段可以得知，小费____', '["正在成为顾客的负担","有助于激励优质服务","对商业发展至关重要","反映了降价的需要"]'::jsonb, '末段说许多顾客感到沮丧，因为他们觉得被过于频繁地索要过高的小费，可见小费正成为顾客的负担，因此选 A。B 项是过去小费的作用，如今小费已与服务质量脱钩；C、D 两项原文没有依据。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2025 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2025 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 1, '根据前两段，英国国民医疗服务体系（NHS）____', '["受资金短缺困扰","已很难满足民众的需求","几乎留不住现有员工","正受到私立医疗的竞争"]'::jsonb, '前两段指出 NHS 的模式已经过时，等待名单人数超过 680 万，无力自费就医的人越来越难获得医疗服务。可见它已难以满足民众需求，因此选 B。A 项资金只是其中一个侧面；C 项原文说的是人力压力濒临极限，不是留不住员工；D 项原文没有把两者作竞争对比。'),
  (27, 2, '应对健康与照护危机的办法之一是____', '["提升医院的效率","减轻社会照护的负担","增加基层医疗的资源","减轻社区承受的压力"]'::jsonb, '第 3 段说需要向社区和基层医疗投入更多资源，以降低对医院的依赖，因此选 C。B 项与原文相反，原文要求扩大社会照护的容量；A、D 两项原文未提。'),
  (28, 2, '“重构健康”项目的目标是____', '["强化医院管理","调整医疗法规","重构医疗体系","重启中断的医疗改革"]'::jsonb, '第 4 段说该项目呼吁对现有的以医院为中心的模式进行紧急反思，实质是重构医疗体系，因此选 C。A 项与否定医院中心模式相悖；D 项原文说的是二十年来多次改革收效甚微，而非改革中断需要重启。'),
  (29, 1, '为最大化国民健康水平，作者建议____', '["出台相关税收政策","充分重视社会性因素","重新评估主要健康结果","提升医疗服务质量"]'::jsonb, '第 5 段估计医疗只决定约 20% 的健康结果，居住、工作与社交场所等社会性决定因素更重要，但缺乏跨部门策略，因此选 B。D 项不是作者强调的重点，作者恰恰认为医疗之外的因素更关键。'),
  (30, 2, '可以推断，地方管理者应当____', '["更合理地行使权力","增强责任意识","在医疗体系中承担更大角色","更好地了解民众的健康需求"]'::jsonb, '末段追问哪些职能应留在中央、哪些应交给地方，并指出地方管理者往往负责那些创造健康的服务且更了解本地需求。可推断他们应在医疗体系中承担更大角色，因此选 C。D 项是原文已陈述的事实，不是推断出的结论。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2025 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2025 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 0, '根据第 1 段，那格浦尔的方案提出的措施旨在____', '["应对极端天气","保证施工质量","监控应急预警","解决工作量过大"]'::jsonb, '第 1 段举例说，那格浦尔的方案要求医院在夏季设立降温病房收治中暑患者，并建议施工方在酷热天让建筑工人停工，这些都是应对极端高温天气的举措，因此选 A。B 项施工质量与原文无关；D 项停工只是其中一条细则，不是方案目标。'),
  (32, 1, '现有高温行动计划存在的一个问题是它们____', '["成本过高难以落实","缺少本地化的预警发布标准","对热浪反应滞后","让医院承受巨大压力"]'::jsonb, '第 2 段说这些计划的预警触发阈值往往没有结合当地气候来定制：有的地方白天高温就足以触发，有的地方夜间温度或湿度同样重要，因此选 B。A 项原文说的是资金不足，不是成本太高；C、D 两项原文未提。'),
  (33, 0, '孟买的案例表明，印度的高温预警系统需要____', '["纳入气温之外的其他因素","考虑细微的天气变化","优先应对可能造成灾害的热浪","争取地方政府更多支持"]'::jsonb, '第 3 段说那天最高气温约 36 摄氏度，比沿海城市的热浪预警阈值还低 1 摄氏度，但湿度放大了高温的影响，而湿度恰恰是预警系统常被忽视的因素。可见预警需要纳入气温以外的因素，因此选 A。B 项表述过于宽泛；D 项原文未提。'),
  (34, 1, '科塔卡尔认为，脆弱性地图能够帮助____', '["防范高湿度的危害","锁定需要特别关注的区域","扩大那格浦尔项目的覆盖范围","为受灾人群制定救助方案"]'::jsonb, '第 4、5 段说所有城市都应绘制脆弱性地图，把应对资源集中到风险最高的人群，例如老年人口多或简易住房集中的街区可获得专门预警或增设降温点，因此选 B。A 项地图本身不能防范湿度危害；C、D 两项不是地图的直接作用。'),
  (35, 3, '根据末段，研究者认为高温行动计划应当____', '["更侧重中暑救治","吸纳更广泛的公众参与","申请更多政府拨款","服务于更广泛的目标"]'::jsonb, '末段说计划不应只包含短期应急响应，还应提出中长期降温措施，例如指导种树位置、改造住房、修订建筑规范，并引用研究者的话说减少应急死亡只是最低目标。可见计划应服务更广泛的目标，因此选 D。A 项与原文相反。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2025 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2025 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 2, '根据第 1 段，自发小径的形成源于____', '["探索周边山丘的好奇心","保护绿地的必要性","追求便捷的倾向","在独处中寻求慰藉的愿望"]'::jsonb, '第 1 段说这些路径体现了人和动物以最高效方式从一点走到另一点的天然能力，抄近道、穿草坪、越山坡都是为了便捷，因此选 C。B 项与原文相反，这些路径恰恰踩坏了整齐的绿地。'),
  (37, 3, '可以推断，俄亥俄州立大学____', '["打算改进校内的自发小径","在自发小径研究上处于领先","引导校内自发小径的形成","对自发小径持肯定态度"]'::jsonb, '第 2 段说该校先让学生在草坪上自由行走，随后把学生踩出的路径铺成正式道路，形成一套有效路网。这说明校方对自发小径持肯定态度，因此选 D。C 项与原文相反，路径由学生自发踩出，校方并未引导。'),
  (38, 0, 'Reddit 页面上的图片反映了____', '["对使用自发小径的对立看法","升级公共空间设计的呼声","对合理规划自发小径的诉求","对公共空间流失的担忧加剧"]'::jsonb, '第 3 段说这些图片展示的自发小径旁立着告示牌，要求行人走指定人行道，凸显了这类路径固有的叛逆性质，反映出公共空间的自发演化与追求视觉管控之间的持续冲突，因此选 A。'),
  (39, 3, '威克夸斯盖克小径的例子说明了____', '["纽约城的发展","自发小径的荷兰起源","城市规划的重要性","自发小径获得承认"]'::jsonb, '第 4 段说这条小径原本由原住民踩出，荷兰殖民者到来后被拓宽为岛上主要商道，英国接管后改名为百老汇。一条自发小径最终成为正式主干道，说明这类路径可以获得承认，因此选 D。B 项错误，小径由原住民而非荷兰人开辟。'),
  (40, 3, '从末段可以得知，自发小径____', '["体现人类对自然的深切敬意","对人的心理健康至关重要","是人类对动物行为的模仿","显示出人与动物共有的特性"]'::jsonb, '末段举了鸭子在冰封池塘上踏出路径、狗在花园里走出直线的例子，说明这类路径在人与动物身上都有体现，因此选 D。C 项错误，原文把人和动物并列，没有说人在模仿动物。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2025 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2026 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 3, '作者受委托要对英国公共图书馆做什么？', '["记录宝贵传统","制定扩建计划","获取读者意见","调研它们当下现状"]'::jsonb, 'commissioned 表示“受委托”。文章首段说明，作者受委托实地调研英国公共图书馆的真实现状，而不是记录历史、制定扩建方案或收集读者问卷。look into 与 investigate current situation 同义，因此选 D。'),
  (22, 2, '根据第 3、4 段，作者发现图书馆____', '["拥有很棒的藏书","保存详细访客记录","履行多样化的功能","主要吸引年轻人"]'::jsonb, '第 3、4 段列举了图书馆除借书外提供的多种服务，包括就业建议、语言课程、数字支持、创业支持和健康检查等。diversified functions 准确概括这些多元功能，因此选 C。'),
  (23, 0, '第 5 段暗示图书馆应当____', '["得到更多重视","实施更严格访问限制","和私人机构合作","更新设备"]'::jsonb, '第 5 段强调图书馆提供免费、开放且独特的公共服务，却仍被忽视和低估，言外之意是图书馆应当得到更多关注，因此选 A。其余选项均未被提及。'),
  (24, 0, '第 6 段的数据表明了____', '["图书馆面临的危机","图书馆的进步","图书馆的贡献","图书馆自身的缺陷"]'::jsonb, '第 6 段用图书馆关闭数量等统计数据说明图书馆正在遭遇生存危机，因此选 A。flaws 指图书馆自身缺陷，而文中危机来自关闭与财政压力，并非其内在问题。'),
  (25, 2, '最后一段给图书馆的建议是？', '["收集公众反馈","争取充足资金","提升用户使用便利","提供终身会员"]'::jsonb, '末段建议加强统一品牌、恢复一卡通用，并为儿童自动办理会员，核心都是降低使用门槛、提升用户便利度，因此选 C。A、B、D 均不是文中提出的建议。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2026 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2026 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 1, '根据第 1 段，员工与人工智能的互动能够____', '["促进他们的职业发展","给予他们情感支持","帮助他们保持动力","改善职场沟通"]'::jsonb, '第 1 段说英国约五分之一的员工把人工智能当朋友交谈，向它寻求个人和职业问题的建议，数据显示这种互动能让人感到被倾听、不那么孤立。这属于情感支持，因此选 B。A、C、D 三项原文均未提及。'),
  (27, 0, '文中引用微软 Copilot 是为了说明使用人工智能可能____', '["对企业构成威胁","产生无用的数据","促进商业合作","鼓励信息共享"]'::jsonb, '第 2 段说微软对用户输入和输出的数据拥有广泛权利，可以任意使用甚至与第三方共享，这意味着企业的敏感信息可能被暴露于外。引用该例正是为了说明风险，因此选 A。D 项虽与共享有关，但原文强调的是威胁而非鼓励共享。'),
  (28, 2, '一些员工违反关于人工智能的规定，原因是____', '["人工智能产品容易获取","希望保持信息灵通","它在工作中作用显著","需要与他人竞争"]'::jsonb, '第 2 段说约 63% 的员工反映使用人工智能提升了工作效率，有些人甚至觉得它比人类同事更能帮上忙。这说明违规的原因是它在工作中作用显著，因此选 C。'),
  (29, 3, '为了积极改变人工智能的格局，企业应当____', '["提高数据来源的透明度","优先保证人工智能产出内容的质量","在制度中纳入员工视角","让管理随人工智能的发展而调整"]'::jsonb, '第 3 段说企业应确立使用人工智能的最佳实践，并制定能随技术演进而不断更新的制度，才能积极改变这一格局。这就是让管理适配技术发展，因此选 D。A、B、C 三项原文均未提及。'),
  (30, 3, '根据末段，我们容易成为人工智能的受害者，是因为我们____', '["对它了解有限","低估了它的经济成本","倾向于夸大它的能力","过度暴露于它之中"]'::jsonb, '末段说市面上产品极多，且都以巨额广告和营销预算推广，因此很容易受害。可见根源在于过度暴露于这些产品，因此选 D。A 项的知识缺口是文中另一处论述，不是末段所指的受害原因。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2026 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2026 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 1, '根据前两段，意大利的高铁网络____', '["被游客视为过时","是受欢迎的出行选择","未被本地人充分利用","是维护良好的范例"]'::jsonb, '第 1 段说自 2008 年罗马至米兰高铁开通以来，火车已成为本地人和游客在意大利境内出行的首选，就时间和成本而言往往是最佳选择，因此选 B。D 项与后文大量维护施工导致严重延误相矛盾。'),
  (32, 0, '第 3 段引用意大利国家铁路集团的数据是为了说明____', '["列车延误已十分普遍","意大利铁路网的价值","媒体对铁路的广泛报道","意铁运营公司的高效率"]'::jsonb, '第 3 段说运行中断日益频繁，延误已成为意大利媒体报道的常客，随后引用该集团数据称 2023 年其运营的高铁有 23% 晚点。引用意图是佐证延误之普遍，因此选 A。'),
  (33, 2, '下列哪一项是该铁路网出现运行中断的原因之一？', '["复杂的列车时刻表","投资不足","运力有限","规模庞大"]'::jsonb, '第 5 段开门见山地说运力不足是另一个问题，并解释混合系统没有余量，线路一有小故障局面就会变得极其复杂，因此选 C。B 项与原文相反，原文提到 240 亿欧元和 1240 亿欧元的巨额投资计划。'),
  (34, 3, '可以得知，混合运行系统____', '["提供了丰富的线路选择","需要额外的运营支出","提升了乘车舒适度","让高铁网络陷入困境"]'::jsonb, '第 5 段解释混合系统指高铁在某些区段或穿越大城市时必须借用普通轨道，一旦发生拥堵或普通列车故障，整个高铁网络都会受到影响，因此选 D。'),
  (35, 1, '意大利铁路网的改进措施将包括____', '["重建普通铁路线","缩短高铁之间的间隔","在市中心增建车站","提升高铁的安全性"]'::jsonb, '末段说高密度技术与卫星信号系统能够缩短同一线路上高铁之间的间距，从而显著提升运力和通行顺畅度，因此选 B。原文提到的是在城市中心修建地下联络线以实现高铁与普通线路分离，不是增建车站。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2026 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2026 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 3, '从第 1 段可以得知，银屋街区派对____', '["已被其他节庆取代","已获得很高的国际声誉","曾在多个街区举办","曾是一场颇具吸引力的文化聚会"]'::jsonb, '第 1 段说它从小型街区聚会发展成大型文化活动，近二十年间每年吸引数万人参加，是芝加哥最受喜爱的街头节庆之一，因此选 D。A、B、C 三项原文均无依据。'),
  (37, 2, '街头节庆组织者面临的一个现实是____', '["他们无法合理使用捐款","他们无法获得足够的设施","他们必须应对财务困境","他们必须加强安保措施"]'::jsonb, '第 2 段说威廉姆斯把制作成本上涨和参与者捐款下降列为无法继续办下去的主要原因，并指出这是当下所有街头节庆组织者共同面对的现实，因此选 C。D 项安保只是成本上涨中的一项，不是整体处境。'),
  (38, 2, '根据第 3、4 段，芝加哥的街头节庆____', '["缓解了典型的城市生活方式","由政府出资","对本地经济有贡献","以音乐演出闻名"]'::jsonb, '第 3 段说这些节庆是经济引擎，直接惠及所在街区和整个芝加哥，为本地商家带来客流，因此选 C。B 项与第 4 段相反，街区节庆得不到市政资金，只有大型官办音乐节才有。'),
  (39, 1, '文中暗示，威克公园节的组织者不得不____', '["依靠业余艺术家参与","减少演出的数量","放弃其最突出的特色","与大企业合作"]'::jsonb, '第 5 段说今年他们被迫缩减节庆规模，撤掉一个舞台、减少签约表演者并进一步削减开支，因此选 B。C 项与原文相反，他们仍努力保持节庆的活力与独特气质。'),
  (40, 1, '作者认为，街头节庆的未来取决于____', '["活动的多样性","参与者的慷慨","街区的声誉","支出的管理"]'::jsonb, '末段说这些节庆之所以存在靠的是社区支持，繁荣的夏季节庆季不会凭空发生，而是所有人共同出力的结果。可见未来取决于参与者的慷慨，因此选 B。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2026 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

commit;
