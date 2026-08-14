create schema if not exists private;

create table private.question_keys (
  question_id uuid primary key references public.questions(id) on delete cascade,
  correct_option smallint not null check (correct_option between 0 and 3),
  prompt_zh text not null,
  option_translations jsonb not null check (jsonb_typeof(option_translations) = 'array' and jsonb_array_length(option_translations) = 4),
  explanation text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private.question_keys enable row level security;
revoke all on schema private from public, anon, authenticated;
revoke all on private.question_keys from public, anon, authenticated;

insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from public.questions q
join public.passages g on g.id = q.passage_id
join public.exam_sections s on s.id = g.section_id
join public.exam_papers p on p.id = s.paper_id
join (values
  (21, 3, '作者受委托要对英国公共图书馆做什么？', '["记录宝贵传统","制定扩建计划","获取读者意见","调研它们当下现状"]'::jsonb, 'commissioned 表示“受委托”。文章首段说明，作者受委托实地调研英国公共图书馆的真实现状，而不是记录历史、制定扩建方案或收集读者问卷。look into 与 investigate current situation 同义，因此选 D。'),
  (22, 2, '根据第 3、4 段，作者发现图书馆____', '["拥有很棒的藏书","保存详细访客记录","履行多样化的功能","主要吸引年轻人"]'::jsonb, '第 3、4 段列举了图书馆除借书外提供的多种服务，包括就业建议、语言课程、数字支持、创业支持和健康检查等。diversified functions 准确概括这些多元功能，因此选 C。'),
  (23, 0, '第 5 段暗示图书馆应当____', '["得到更多重视","实施更严格访问限制","和私人机构合作","更新设备"]'::jsonb, '第 5 段强调图书馆提供免费、开放且独特的公共服务，却仍被忽视和低估，言外之意是图书馆应当得到更多关注，因此选 A。其余选项均未被提及。'),
  (24, 0, '第 6 段的数据表明了____', '["图书馆面临的危机","图书馆的进步","图书馆的贡献","图书馆自身的缺陷"]'::jsonb, '第 6 段用图书馆关闭数量等统计数据说明图书馆正在遭遇生存危机，因此选 A。flaws 指图书馆自身缺陷，而文中危机来自关闭与财政压力，并非其内在问题。'),
  (25, 2, '最后一段给图书馆的建议是？', '["收集公众反馈","争取充足资金","提升用户使用便利","提供终身会员"]'::jsonb, '末段建议加强统一品牌、恢复一卡通用，并为儿童自动办理会员，核心都是降低使用门槛、提升用户便利度，因此选 C。A、B、D 均不是文中提出的建议。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation)
  on v.question_number = q.question_number
where p.year = 2026 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

create or replace function public.submit_practice_attempt(attempt_uuid uuid, submitted_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  attempt_row public.practice_attempts%rowtype;
  question_total integer;
  answer_total integer;
  correct_total integer;
  grading jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if jsonb_typeof(submitted_answers) <> 'object' then raise exception 'Answers must be an object'; end if;

  select * into attempt_row
  from public.practice_attempts
  where id = attempt_uuid and user_id = auth.uid()
  for update;
  if not found then raise exception 'Attempt not found'; end if;

  select count(*) into question_total from public.questions where passage_id = attempt_row.passage_id and status = 'published';
  select count(*) into answer_total
  from jsonb_each_text(submitted_answers) a
  join public.questions q on q.passage_id = attempt_row.passage_id and q.question_number::text = a.key
  where a.value ~ '^[0-3]$';
  if question_total = 0 or answer_total <> question_total then raise exception 'All questions must be answered'; end if;

  select count(*) into correct_total
  from public.questions q
  join private.question_keys k on k.question_id = q.id
  where q.passage_id = attempt_row.passage_id
    and (submitted_answers ->> q.question_number::text)::smallint = k.correct_option;

  if (select count(*) from private.question_keys k join public.questions q on q.id = k.question_id where q.passage_id = attempt_row.passage_id) <> question_total then
    raise exception 'Answer key unavailable';
  end if;

  select jsonb_agg(jsonb_build_object(
    'questionNumber', q.question_number,
    'selectedOption', (submitted_answers ->> q.question_number::text)::smallint,
    'correctOption', k.correct_option,
    'isCorrect', (submitted_answers ->> q.question_number::text)::smallint = k.correct_option,
    'promptZh', k.prompt_zh,
    'optionTranslations', k.option_translations,
    'explanation', k.explanation
  ) order by q.question_number) into grading
  from public.questions q join private.question_keys k on k.question_id = q.id
  where q.passage_id = attempt_row.passage_id;

  update public.practice_attempts
  set answers = submitted_answers, submitted_at = now(), score = correct_total
  where id = attempt_uuid;

  return jsonb_build_object('score', correct_total, 'total', question_total, 'questions', grading);
end;
$$;

revoke all on function public.submit_practice_attempt(uuid, jsonb) from public, anon;
grant execute on function public.submit_practice_attempt(uuid, jsonb) to authenticated;
