insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q join passages g on g.id = q.passage_id join exam_sections s on s.id = g.section_id join exam_papers p on p.id = s.paper_id
join (values
  (21, 3, '作者受委托要对英国公共图书馆做什么？', '["记录宝贵传统","制定扩建计划","获取读者意见","调研它们当下现状"]'::jsonb, 'commissioned 表示“受委托”。文章首段说明，作者受委托实地调研英国公共图书馆的真实现状，而不是记录历史、制定扩建方案或收集读者问卷。look into 与 investigate current situation 同义，因此选 D。'),
  (22, 2, '根据第 3、4 段，作者发现图书馆____', '["拥有很棒的藏书","保存详细访客记录","履行多样化的功能","主要吸引年轻人"]'::jsonb, '第 3、4 段列举了图书馆除借书外提供的多种服务，包括就业建议、语言课程、数字支持、创业支持和健康检查等。diversified functions 准确概括这些多元功能，因此选 C。'),
  (23, 0, '第 5 段暗示图书馆应当____', '["得到更多重视","实施更严格访问限制","和私人机构合作","更新设备"]'::jsonb, '第 5 段强调图书馆提供免费、开放且独特的公共服务，却仍被忽视和低估，言外之意是图书馆应当得到更多关注，因此选 A。其余选项均未被提及。'),
  (24, 0, '第 6 段的数据表明了____', '["图书馆面临的危机","图书馆的进步","图书馆的贡献","图书馆自身的缺陷"]'::jsonb, '第 6 段用图书馆关闭数量等统计数据说明图书馆正在遭遇生存危机，因此选 A。flaws 指图书馆自身缺陷，而文中危机来自关闭与财政压力，并非其内在问题。'),
  (25, 2, '最后一段给图书馆的建议是？', '["收集公众反馈","争取充足资金","提升用户使用便利","提供终身会员"]'::jsonb, '末段建议加强统一品牌、恢复一卡通用，并为儿童自动办理会员，核心都是降低使用门槛、提升用户便利度，因此选 C。A、B、D 均不是文中提出的建议。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2026 and s.type = 'reading_a' and g.passage_number = 1;
