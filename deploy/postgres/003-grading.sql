-- 本文件由 scripts/build-answer-keys.mjs 生成，请勿手工编辑。
-- 修改答案请编辑 content/answer-keys/<年份>.json 后重新生成。
begin;

-- 2010 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 3, '在第一段中，Damien Hirst的拍卖被称为“最后的胜利”，因为____', '["艺术市场经历了一系列的胜利。","拍卖师最终以最高出价拍出了那两件作品。","《在我心中永远美丽》战胜了所有杰作。","它是在全球金融危机爆发前成功举行的。"]'::jsonb, '原文提到，拍卖在2008年9月15日举行，而就在拍卖师喊出报价时，雷曼兄弟申请破产，这标志着金融危机的开始。因此，这次拍卖是危机前的最后一次成功，故D正确。A项文中未提及一系列胜利；B项与原文不符，原文说除两件外全部售出；C项无中生有。'),
  (22, 0, '通过说“任何形式的支出都变得非常不合时宜”（第三段），作者暗示____', '["收藏家不再积极参与艺术市场拍卖。","人们停止了所有形式的支出，远离画廊。","艺术收藏作为一种时尚在很大程度上失去了吸引力。","艺术品总体上已经过时，因此不值得购买。"]'::jsonb, '原文说“在艺术界，这意味着收藏家远离画廊和拍卖行”，说明收藏家不再积极参与，故A正确。B项“人们停止了所有形式的支出”过于绝对，原文强调“任何形式的支出”在语境中指艺术相关支出；C项“艺术收藏作为一种时尚”并非原文重点；D项“艺术品过时”与原文不符。'),
  (23, 1, '以下哪项陈述是不正确的？', '["2007年至2008年，当代艺术销售额大幅下降。","艺术市场在势头方面超越了许多其他行业。","艺术市场总体上以各种方式下滑。","一些艺术品经销商正在等待更好的机会。"]'::jsonb, '原文说“艺术市场产生的兴趣远远超出其规模，因为它将巨额财富、巨大的自我、贪婪、激情和争议结合在一起，其方式很少有其他行业能与之匹敌”，这指的是兴趣而非势头，且并未说超越其他行业，故B不正确。A项对应“当代艺术销售额下降了三分之二”；C项对应“艺术市场下滑”；D项对应“任何不需要出售的人都在观望，等待信心恢复”。'),
  (24, 2, '最后一段提到的“三个D”是____', '["拍卖行的最爱。","当代趋势。","促进艺术品流通的因素。","代表印象派的风格。"]'::jsonb, '原文说“死亡、债务和离婚——仍然将艺术品推向市场”，即这些因素促使艺术品进入市场流通，故C正确。A项“拍卖行的最爱”无依据；B项“当代趋势”不准确；D项“印象派风格”与原文无关。'),
  (25, 2, '本文最合适的标题可能是____。', '["艺术价格的波动","最新的艺术拍卖","衰退中的艺术市场","对艺术兴趣的转移"]'::jsonb, '全文主要讨论艺术市场的下滑，从赫斯特拍卖的“最后胜利”到市场下跌、销售额下降、拍卖行赔付等，故C项“衰退中的艺术市场”最合适。A项“波动”过于宽泛；B项“最新的艺术拍卖”只涉及部分内容；D项“兴趣转移”文中未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2010 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2010 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 0, '大多数妻子对丈夫的主要期望是什么？', '["和他们交谈。","信任他们。","支持她们的事业。","分担家务。"]'::jsonb, '根据原文，作者发现“most wives want their husbands to be, first and foremost, conversational partners”，即大多数妻子首先希望丈夫成为交谈伙伴，因此正确选项为A。B、C、D在文中未提及或不是主要期望。'),
  (27, 2, '根据上下文，短语“wreaking havoc”（第二段）最可能的意思是____', '["产生动力。","施加影响。","造成破坏。","制造压力。"]'::jsonb, '原文提到这种模式“is wreaking havoc with marriage”，结合上下文，该模式导致婚姻问题，如离婚率上升，因此“wreaking havoc”意为“造成严重破坏”，对应C。A、B、D均不符合语境。'),
  (28, 1, '以下所有陈述都是正确的，除了____', '["男性在公共场合往往比女性说话多。","近50%的近期离婚是由失败的交谈造成的。","女性非常重视夫妻之间的交流。","女性在家往往比配偶更健谈。"]'::jsonb, '原文提到“American men tend to talk more than women in public situations”，A正确；提到“current divorce rate of nearly 50 percent”，但并未说50%的离婚是由交谈失败导致，只是说“that amounts to millions of cases... a virtual epidemic of failed conversation”，因此B错误；文中女性抱怨丈夫不沟通，且多数女性将缺乏交流作为离婚原因，说明C正确；文中男性说妻子是家里的说话者，且女性在家更健谈，D正确。因此选B。'),
  (29, 3, '以下哪项最能概括本文的主旨？', '["道德败坏值得社会学家更多研究。","婚姻破裂源于性别不平等。","丈夫和妻子对婚姻有不同的期望。","丈夫和妻子之间的交谈模式不同。"]'::jsonb, '文章主要讨论男女在公共和家庭场合交谈模式的差异，以及这种差异对婚姻的影响，重点在于交谈模式的不同，而非道德或性别不平等，因此D正确。A、B、C均偏离主旨。'),
  (30, 1, '在本文之后的下一部分，作者最可能关注____。', '["对《离婚谈话》这本新书的生动描述","对那幅刻板漫画的详细描述","美国高离婚率的其他可能原因","对政治学家安德鲁·哈克的简要介绍"]'::jsonb, '文章最后提到“the stereotypical cartoon scene of a man sitting at the breakfast table with a newspaper held up in front of his face, while a woman glares at the back of it, wanting to talk”，作者很可能接下来详细描述这幅漫画，以进一步说明问题，因此B正确。A、C、D在文中已提及或不是紧接着的内容。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2010 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2010 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 0, '根据柯蒂斯博士的观点，像用肥皂洗手这样的习惯____', '["应该进一步培养。","应该逐渐改变。","在历史上根深蒂固。","基本上是私人问题。"]'::jsonb, '柯蒂斯博士说：“存在基本的公共卫生问题，比如不用肥皂洗手的习惯，这些问题仍然是杀手，仅仅是因为我们想不出如何改变人们的习惯。”这表明他认为像用肥皂洗手这样的好习惯需要被培养和推广，而不是改变或视为私人问题。因此，选项A正确。选项B“应该逐渐改变”与原文不符，因为柯蒂斯博士希望建立新习惯而非改变现有习惯；选项C“在历史上根深蒂固”未提及；选项D“基本上是私人问题”与公共卫生问题相悖。'),
  (32, 0, '第五段提到瓶装水、口香糖和润肤霜是为了____', '["揭示它们对人们习惯的影响。","显示日常必需品的迫切需求。","表明它们对人们购买力的影响。","证明好习惯的重要作用。"]'::jsonb, '第五段列举了瓶装水、口香糖和润肤霜等产品，说明它们如何通过广告和营销成为人们日常习惯的一部分，例如办公室工作人员整天无意识地喝瓶装水，口香糖被宣传为饭后清新口气和清洁牙齿的产品。这些例子旨在说明产品对人们习惯的影响，因此选项A正确。选项B“日常必需品的迫切需求”未提及；选项C“购买力”未涉及；选项D“好习惯”不准确，因为这些习惯是制造出来的，不一定都是好习惯。'),
  (33, 3, '下列哪一项不属于帮助创造人们习惯的产品？', '["汰渍。","佳洁士。","高露洁。","联合利华。"]'::jsonb, '文章提到汰渍（Tide）、佳洁士（Crest）和高露洁（Colgate）是具体的产品品牌，而联合利华（Unilever）是生产这些产品的公司之一，不是产品本身。因此，选项D不属于产品。'),
  (34, 2, '从文中我们得知，一些消费者的习惯是由于____而形成的。', '["完美的产品艺术。","自动行为的创造。","商业促销。","科学实验。"]'::jsonb, '文章提到，公司通过精心设计的日常提示和“无情的广告”来创造消费者的自动行为，例如“由于精明的广告和公共卫生运动，许多美国人习惯性地每天刷牙两次”。因此，消费者的习惯是商业促销（广告）的结果，选项C正确。选项A“完美的产品艺术”是比喻，不是原因；选项B“自动行为的创造”是结果而非原因；选项D“科学实验”是研究手段，不是直接原因。'),
  (35, 1, '作者对广告对人们习惯的影响的态度是____。', '["冷漠的","否定的","肯定的","有偏见的"]'::jsonb, '文章最后提到：“当这些策略被用来销售有问题的美容霜或不健康的食品时，争议就爆发了。”这表明作者对广告影响人们习惯的方式持批评态度，尤其是当它用于推销不健康产品时。因此，作者的态度是否定的，选项B正确。选项A“冷漠”不符合；选项C“肯定”与批评性描述不符；选项D“有偏见”不准确，作者是基于事实的批评。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2010 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2010 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 3, '从美国陪审团制度的原则中，我们了解到____', '["有文化和没文化的人都可以担任陪审员。","被告免于由同龄人审判。","陪审员服务不应设置年龄限制。","判决应考虑公众的意见。"]'::jsonb, '正确选项为D。原文提到“verdicts should represent the conscience of the community and not just the letter of the law”，即判决应代表社区的良知，而不仅仅是法律条文，这对应了“判决应考虑公众的意见”。A选项错误，因为原文说“all citizens who meet minimal qualifications of age and literacy”，即有最低文化和年龄要求，并非所有有文化和没文化的人都可以。B选项与原文“defendants are entitled to trial by their peers”相矛盾。C选项错误，原文有“minimal qualifications of age”，说明有年龄限制。'),
  (37, 0, '1968年之前选择所谓的精英陪审员的做法表明____', '["反歧视法律的不足。","对某些种族的普遍歧视。","陪审员选择程序中的冲突理想。","最高法院法官中常见的傲慢。"]'::jsonb, '正确选项为A。原文提到“the practice of selecting so-called elite or blue-ribbon juries provided a convenient way around this and other antidiscrimination laws”，即选择精英陪审员的做法为绕过反歧视法律提供了便利，说明反歧视法律存在不足。B选项过于狭窄，原文主要强调绕过法律而非普遍歧视。C选项是事实描述，但并非该做法所表明的。D选项无中生有。'),
  (38, 2, '即使在20世纪60年代，在一些州女性很少出现在陪审团名单上，因为____', '["她们被州法律自动禁止。","她们远远达不到所需的资格。","她们被认为应该做家务。","她们倾向于逃避公共事务。"]'::jsonb, '正确选项为C。原文提到“This practice was justified by the claim that women were needed at home”，即这种做法以女性在家需要为由，说明女性被认为应承担家庭职责。A选项错误，原文说“several states automatically exempted women from jury duty unless they personally asked”，并非禁止，而是豁免。B选项无依据。D选项是主观推断，原文未提及。'),
  (39, 1, '《陪审团遴选和服务法》通过后，____', '["陪审团遴选中的性别歧视违宪，必须废除。","在联邦陪审员遴选中，教育要求变得不那么严格。","州级陪审员应代表整个社区。","各州应在改革陪审团制度方面与联邦法院保持一致。"]'::jsonb, '正确选项为B。原文提到“This law abolished special educational requirements for federal jurors”，即该法废除了联邦陪审员的特殊教育要求，说明教育要求变得不那么严格。A选项是1975年Taylor案的决定，不是该法通过后的直接结果。C选项也是Taylor案的内容。D选项在原文中未提及。'),
  (40, 3, '在讨论美国陪审团制度时，文章主要围绕____', '["其性质和问题。","其特点和传统。","其问题和解决方案。","其传统和发展。"]'::jsonb, '正确选项为D。文章首先介绍了陪审团制度的民主原则和传统，然后讨论了1968年之前存在的问题，最后通过立法和法院判决进行了改革，体现了传统和发展。A选项只涉及部分内容。B选项未提及问题。C选项虽然提到问题和解决方案，但文章更侧重于传统和演变，而非单纯的问题解决。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2010 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2011 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 1, '根据第一段，西蒙斯女士因____而受到批评。', '["获得过多利润。","未能履行她的职责。","拒绝做出妥协。","在困难时期离开董事会。"]'::jsonb, '正确选项是B。第一段提到，西蒙斯女士因在高盛薪酬委员会任职而受到批评，因为她让那些巨额奖金支出未受关注地通过，这暗示她未能履行作为外部董事的监督职责。A项“获得过多利润”是批评的背景，但不是她受批评的直接原因；C项“拒绝妥协”和D项“在困难时期离开董事会”在文中未提及或不是批评的原因。'),
  (22, 3, '从第二段我们了解到，外部董事应该是____。', '["慷慨的投资者。","公正的高管。","股价预测者。","独立的顾问。"]'::jsonb, '正确选项是D。第二段明确指出：“外部董事应该作为公司董事会中有帮助但偏见较少的顾问”，并且他们“有足够的独立性来反对首席执行官的提议”。因此，他们被期望是独立的顾问。A项“慷慨的投资者”未提及；B项“公正的高管”不准确，因为他们不是高管；C项“股价预测者”未提及。'),
  (23, 2, '根据俄亥俄大学的研究人员，在外部董事意外离开后，公司可能____。', '["变得更加稳定。","报告增加的收益。","在股市上表现更差。","在诉讼中表现更差。"]'::jsonb, '正确选项是C。第三段提到，在意外离开后，公司随后重述收益的可能性增加近20%，被联邦集体诉讼点名的可能性增加，并且“股票可能表现更差”。因此，公司在股市上表现更差是直接提到的。A项“变得更加稳定”与研究发现相反；B项“报告增加的收益”与重述收益增加不符；D项“在诉讼中表现更差”不准确，文中说的是被诉讼的可能性增加，而不是在诉讼中表现差。'),
  (24, 0, '从最后一段可以推断出，外部董事____。', '["可能会因为公司的诱人条件而留下。","经常在公司中有不当行为的记录。","习惯于公司中无压力的工作。","会拒绝公司的激励。"]'::jsonb, '正确选项是A。最后一段提到：“想要在困难时期留住外部董事的公司可能必须创造激励措施。”这暗示如果公司提供激励，外部董事可能会留下。因此，可以推断他们可能会因为诱人的条件而留下。B项“经常有不当行为记录”与原文不符，原文说即使历史回顾显示他们在不当行为发生时在董事会，但并不意味着他们自己有不当行为；C项“习惯于无压力工作”未提及；D项“会拒绝激励”与原文相反，因为原文说公司需要创造激励来留住他们。'),
  (25, 1, '作者对外部董事角色的态度是____。', '["宽容的。","积极的。","轻蔑的。","批评的。"]'::jsonb, '正确选项是B。整篇文章对外部董事的作用持肯定态度。第二段描述了他们的理想角色，第三段和第四段虽然指出了问题，但最后一段建议公司创造激励来留住他们，并提到西蒙斯女士在校园再次受欢迎，这暗示作者认为外部董事是有价值的。因此，作者的态度是积极的。A项“宽容的”不准确；C项“轻蔑的”和D项“批评的”与文章基调不符。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2011 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2011 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 3, '通过说“像《旧金山纪事报》这样的报纸……在记录自己的厄运”（第一段），作者暗示报纸____', '["忽视了危机的迹象。","未能获得政府补贴。","不是慈善公司。","处于绝望的境地。"]'::jsonb, '正确选项D。原文提到“The recession threatened to remove the advertising and readers...Newspapers like the San Francisco Chronicle were chronicling their own doom.”说明报纸面临广告和读者流失，自身也在报道自己的厄运，表明它们处境艰难。A项“忽视危机迹象”与原文不符，原文是意识到危机；B项“未能获得政府补贴”和C项“不是慈善公司”是文中提到的讨论内容，但不是作者这句话的意图。'),
  (27, 1, '一些报纸拒绝向遥远的郊区投递，可能是因为____', '["读者威胁要少付钱。","报纸想要降低成本。","记者很少报道这些地区。","订阅者抱怨报纸变薄。"]'::jsonb, '正确选项B。原文提到“Many papers stayed afloat by pushing journalists overboard...Some papers even had the nerve to refuse delivery to distant suburbs.”这些是报纸为了生存而采取的削减成本的措施，拒绝向偏远地区投递是为了减少运输成本。A项“读者威胁要少付钱”未提及；C项“记者很少报道这些地区”与成本无关；D项“订阅者抱怨报纸变薄”是读者反应，不是原因。'),
  (28, 2, '与美国同行相比，日本报纸更加稳定，因为它们____', '["有更多的收入来源。","有更平衡的新闻编辑室。","对广告的依赖较少。","受读者群的影响较小。"]'::jsonb, '正确选项C。原文提到“American papers have long been highly unusual in their reliance on ads. Fully 87% of their revenues came from advertising...In Japan the proportion is 35%. Not surprisingly, Japanese newspapers are much more stable.”说明日本报纸广告收入占比低，因此更稳定。A项“有更多的收入来源”虽然可能正确，但原文强调的是广告依赖度低；B项“更平衡的新闻编辑室”未提及；D项“受读者群影响较小”未提及。'),
  (29, 0, '从最后一段可以推断出关于当前报纸行业的什么？', '["独特性是报纸的一个重要特征。","完整性是报纸失败的原因。","国外分社在报纸行业中起着关键作用。","读者对汽车和电影评论失去了兴趣。"]'::jsonb, '正确选项A。最后一段提到“much of the damage has been concentrated in areas where newspapers are least distinctive...Newspapers are less complete as a result. But completeness is no longer a virtue in the newspaper business.”说明报纸削减了非独特性内容，而完整性不再重要，暗示独特性是报纸的重要特征。B项“完整性是失败原因”与原文“completeness is no longer a virtue”不符；C项“国外分社起关键作用”与原文“Foreign bureaus have been savagely cut off”相反；D项“读者失去兴趣”未提及，只是评论员被裁。'),
  (30, 0, '这篇文章最合适的标题是____', '["美国报纸：为生存而挣扎。","美国报纸：随风而逝。","美国报纸：繁荣的业务。","美国报纸：绝望的故事。"]'::jsonb, '正确选项A。文章描述了美国报纸面临危机但通过削减成本等措施幸存并恢复盈利，整体是挣扎求生的过程。B项“随风而逝”暗示消亡，与事实不符；C项“繁荣”过于乐观，文章提到利润下降；D项“绝望”过于悲观，文章提到已恢复盈利。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2011 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2011 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 2, '战后美国住房风格主要反映了美国人的____', '["繁荣与增长。","效率与实用。","节制与自信。","自豪与忠诚。"]'::jsonb, '根据原文第一段，战后时期美国人学会了节制（restraint），并且对未来充满信心（confidence），这种节制与自信的结合使得小而高效的住房成为时尚。因此，住房风格主要反映了节制与自信。选项A是战后整体时代的特征，但并非住房风格的主要反映；选项B虽然提到效率，但未包含自信；选项D在文中未提及。'),
  (32, 3, '从第三段可以推断出关于包豪斯的以下哪项？', '["它是由路德维希·密斯·凡·德·罗创立的。","它的设计理念受到了第二次世界大战的影响。","大多数美国建筑师曾与它有关联。","它对美国建筑产生了巨大影响。"]'::jsonb, '原文第三段提到，与包豪斯相关的人（包括密斯）移民到美国并对美国建筑产生巨大影响，其中密斯影响最大。因此可以推断包豪斯对美国建筑有巨大影响。选项A错误，文中未说密斯创立包豪斯；选项B未提及二战对包豪斯理念的影响；选项C“大多数”过于绝对，文中只说“其他与包豪斯相关的人”，并非大多数美国建筑师。'),
  (33, 2, '密斯认为建筑设计的优雅____', '["与大面积空间有关。","等同于空旷。","不依赖于丰富的装饰。","与效率无关。"]'::jsonb, '原文第四段明确说密斯的标志性短语“少即是多”意味着更少的装饰，如果组织得当，比大量装饰更有影响力。他认为优雅并非来自丰富。因此，优雅不依赖于丰富的装饰。选项A和B与原文相反，密斯的设计是小的、高效的，而非大而空；选项D错误，密斯的设计是高效的，优雅与效率相关。'),
  (34, 3, '关于密斯在芝加哥湖滨大道上建造的公寓，以下哪项是正确的？', '["它们忽略了细节和比例。","它们使用了当时流行的材料建造。","它们比邻近的建筑更宽敞。","它们具有抽象艺术的一些特征。"]'::jsonb, '原文第五段提到，这些公寓虽然较小，但因其玻璃墙、景观以及建筑细节和比例的优雅而受欢迎，这种优雅是当时流行的抽象艺术的建筑等价物。因此，它们具有抽象艺术的特征。选项A错误，文中强调细节和比例的优雅；选项B错误，材料是象征未来的，而非当时流行；选项C错误，它们比邻近的公寓更小。'),
  (35, 1, '关于“案例研究住宅”的设计，我们能了解到什么？', '["机械设备被广泛使用。","自然景观被考虑在内。","为了整体效果牺牲了细节。","使用了环保材料。"]'::jsonb, '原文最后一段提到，“案例研究住宅”的美学效果来自景观、新材料和直率的细节处理。因此，自然景观被考虑在内。选项A错误，文中提到拉尔夫·拉普森错误预测了机械革命的影响，但并未说机械设备被广泛使用；选项C错误，细节处理是直率的，并未牺牲；选项D错误，文中未提及环保材料。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2011 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2011 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 1, '欧盟面临如此多的问题，以至于____', '["它或多或少已经对市场失去了信心。","甚至它的支持者们也开始感到担忧。","它的一些成员国计划放弃欧元。","它打算否认贬值的可能性。"]'::jsonb, '原文第一段提到“Now even the project’s greatest cheerleaders talk of a continent facing a ‘Bermuda triangle’ of debt, population decline and lower growth.”，其中“greatest cheerleaders”即最热心的支持者，他们现在也谈论欧盟面临的困境，说明支持者也开始担忧。因此B正确。A项“对市场失去信心”是市场对欧元区失去信心，而非欧盟对市场失去信心，故排除。C项“成员国计划放弃欧元”文中未提及，排除。D项“否认贬值可能性”是欧元区单一货币制度本身的特点，并非欧盟意图，排除。'),
  (37, 2, '关于欧盟单一货币的辩论陷入僵局，因为主导力量____', '["正在争夺领导地位。","忙于处理自己的危机。","未能就协调达成一致。","在走向解体的步骤上意见不一。"]'::jsonb, '原文第二段指出“It is stuck because the euro zone’s dominant powers, France and Germany, agree on the need for greater harmonisation within the euro zone, but disagree about what to harmonise.”，即法德同意需要加强协调，但在协调什么上意见不一，因此C正确。A项“争夺领导地位”文中未提及，排除。B项“忙于处理自己的危机”与原文不符，排除。D项“在走向解体的步骤上意见不一”与原文相反，原文是讨论如何拯救欧元，而非解体，排除。'),
  (38, 1, '为了解决欧元问题，德国提议____', '["增加对贫困地区的欧盟资金。","实施更严格的法规。","只有核心成员国参与经济协调。","保障欧盟成员国的投票权。"]'::jsonb, '原文第二段提到“Germany thinks the euro must be saved by stricter rules on borrowing, spending and competitiveness, backed by quasi-automatic sanctions...”，即德国认为必须通过更严格的规则来拯救欧元，因此B正确。A项“增加对贫困地区的资金”与原文相反，德国威胁要冻结资金，排除。C项“只有核心成员国参与”是法国的观点，德国主张所有27个成员国参与，排除。D项“保障投票权”与原文相反，德国提议可能暂停投票权，排除。'),
  (39, 0, '法国处理危机的提议暗示____', '["贫穷国家更有可能获得资金。","严格的货币政策将适用于贫穷国家。","富裕国家将容易获得贷款。","富裕国家将基本控制欧元债券。"]'::jsonb, '原文第三段提到法国提议“a system of redistribution from richer to poorer members, via cheaper borrowing for governments through common Eurobonds or complete fiscal transfers”，即通过共同欧元债券或财政转移实现从富国到穷国的再分配，这意味着穷国更有可能获得资金，因此A正确。B项“严格的货币政策”与法国主张政治家干预货币政策不符，排除。C项“富裕国家容易获得贷款”与再分配方向相反，排除。D项“富裕国家控制欧元债券”文中未提及，排除。'),
  (40, 3, '关于欧盟的未来，作者似乎感到____', '["悲观。","绝望。","自负。","充满希望。"]'::jsonb, '原文最后一段提到“It is too soon to write off the EU. It remains the world’s largest trading block... It is an ambitious attempt to blunt the sharpest edges of globalisation, and make capitalism benign.”，作者认为现在放弃欧盟为时过早，并强调其成就和积极意义，表明作者对欧盟未来持乐观态度，因此D正确。A、B、C均与作者态度不符，排除。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2011 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2012 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 0, '第一段暗示，如今家庭作业____', '["受到更多批评。","获得更多偏好。","不再是教育惯例。","高级课程不需要。"]'::jsonb, '第一段提到“in recent years it has been particularly scorned”，其中“scorned”意为“鄙视、批评”，说明家庭作业近年来受到更多批评。选项A正确。选项B与原文相反；选项C错误，因为原文说“revising their thinking on this educational ritual”，表明它仍是教育惯例，只是重新思考；选项D错误，原文说“with the exception of some advanced courses”，意味着高级课程除外，但并未说高级课程不需要作业。'),
  (22, 2, '洛杉矶联合学区制定关于家庭作业的规定，主要是因为贫困学生____', '["往往对他们的教育期望不高。","要求不同的教育标准。","可能在完成家庭作业方面有问题。","表达了他们对家庭作业的抱怨。"]'::jsonb, '第二段明确说“This rule is meant to address the difficulty that students from impoverished or chaotic homes might have in completing their homework.”，即该规定旨在解决贫困或混乱家庭学生完成作业的困难。因此选项C正确。选项A、B、D在原文中没有提及。'),
  (23, 3, '根据第三段，该政策的一个问题是它可能____', '["导致学生对成绩单漠不关心。","削弱州考的权力。","限制教师的教育权力。","阻止学生做家庭作业。"]'::jsonb, '第三段提到“students can easily skip half their homework and see very little difference on their report cards”，说明学生可以轻易跳过一半作业而成绩单上几乎没变化，这会鼓励学生不做作业。选项D正确。选项A错误，因为学生可能对成绩单不关心，但原文强调的是作业与成绩的关系，而非对成绩单的态度；选项B错误，原文未提及州考权威；选项C错误，原文说政策“imposes a flat, across-the-board rule”，但并未说限制教师权力，而是说没有赋予教师权力。'),
  (24, 1, '如第四段所述，关于家庭作业的一个未回答的关键问题是它是否____', '["应该被取消。","在学校教育中占很大比重。","给教师带来额外负担。","对成绩很重要。"]'::jsonb, '第四段提出“If the district finds homework to be unimportant to its students’ academic achievement, it should move to reduce or eliminate the assignments... Conversely, if homework matters, it should account for a significant portion of the grade.”，说明关键问题是家庭作业是否重要，是否应在学业中占重要比重。选项B正确。选项A是政策可能的结果而非问题；选项C未提及；选项D虽然相关，但更具体的是“是否重要”而非“对成绩重要”，且原文强调“academic achievement”和“grade”的关联，但核心是重要性。'),
  (25, 0, '这篇文章合适的标题可能是____', '["一种错误的家庭作业处理方法。","一项受贫困学生欢迎的政策。","关于家庭作业的棘手问题。","对一项教育政策的错误解读。"]'::jsonb, '全文批评了洛杉矶联合学区的家庭作业政策，认为其“unclear and contradictory”，并指出它没有解决真正的问题，因此是“a faulty approach”。选项A正确。选项B错误，因为政策并非受贫困学生欢迎，而是试图帮助他们但效果不佳；选项C过于宽泛，文章重点不是讨论问题本身而是批评政策；选项D错误，文章不是关于错误解读，而是政策本身有缺陷。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2012 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2012 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 2, '作者说“它只是彩虹中的一小部分”（第一段），意思是粉色____', '["不能解释女孩缺乏想象力。","不应该与女孩的天真联系在一起。","不应该成为女孩气质的唯一代表。","不能影响女孩的生活和兴趣。"]'::jsonb, '正确项C。原文说“粉色本身并不坏，但它只是彩虹中的一小部分”，紧接着指出“尽管它可能以某种方式庆祝少女时代，但它也反复而坚定地将女孩的身份与外表融合在一起”，暗示粉色被过度强调为女孩气质的代表，而实际上女孩气质应更多元。A项无中生有，原文未提及粉色与想象力的关系；B项是过度推断，原文未说粉色不应与天真联系，而是说粉色将天真与外表联系；D项与原文矛盾，原文承认粉色在女孩生活中普遍存在，且影响她们的身份认同。'),
  (27, 1, '根据第二段，关于颜色以下哪项是正确的？', '["颜色编码在女孩的DNA中。","蓝色曾经被认为是女孩的颜色。","白色是婴儿的首选。","粉色在象征性别方面曾经是中性色。"]'::jsonb, '正确项B。原文明确说“蓝色，带有圣母玛利亚的暗示，象征忠诚和忠贞，代表女性气质”，因此蓝色曾被视为女孩的颜色。A项与原文矛盾，原文说“女孩对粉色的吸引可能看起来不可避免，但并非如此”，且未说颜色编码在DNA中；C项错误，原文说“所有婴儿都穿白色是出于实际考虑”，并非偏好；D项错误，原文说粉色曾被认为是更男性化的颜色，而非中性色。'),
  (28, 1, '作者认为我们对儿童心理发展的认知很大程度上受到____的影响。', '["对儿童天性的观察。","儿童产品的营销。","对儿童行为的研究。","对儿童消费的研究。"]'::jsonb, '正确项B。原文说“我没有意识到营销趋势如何深刻地支配了我们对孩子天性的认知，包括我们对他们心理发展的核心信念”，直接指出营销的影响。A项与原文相反，原文暗示我们的认知并非基于观察；C项是作者曾有的错误假设，但被否定；D项范围过窄，且原文提到的是“儿童消费主义历史学家”的观点，但影响认知的是营销趋势，而非研究本身。'),
  (29, 0, '从第四段我们可以得知，百货商店被建议____', '["将消费者划分为更小的群体。","对不同性别给予同等重视。","专注于婴儿服装和大童服装。","创造一些常见的购物者术语。"]'::jsonb, '正确项A。原文说“贸易出版物建议百货商店，为了增加销售，他们应该在婴儿服装和大童服装之间创造‘第三块踏脚石’”，即细分市场，且后文说“将孩子或成人分成更小的类别已被证明是提高利润的可靠方法”。B项无中生有，原文未提及同等重视；C项是建议之前的状态，而非建议本身；D项是结果而非建议，且“toddler”成为常用术语是细分后的结果。'),
  (30, 2, '可以得出结论，女孩对粉色的吸引似乎是____', '["被服装制造商完全理解。","由她们的天生倾向清楚解释。","主要由逐利的商人强加。","被心理学专家很好地解释。"]'::jsonb, '正确项C。原文指出粉色在女孩中的流行是营销策略的结果，如“直到20世纪80年代中期，当放大年龄和性别差异成为主导的儿童营销策略时，粉色才真正流行起来”，且最后说“细分市场最容易的方法之一是放大性别差异——或者在没有差异的地方发明差异”，表明是商人为了利润而推动的。A项过度推断，制造商可能理解营销，但原文未说“完全理解”；B项与原文矛盾，原文否认天生倾向；D项错误，原文否定了专家研究的解释，如“toddler”阶段是营销技巧而非专家研究结果。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2012 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2012 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 0, '从第一段可以得知，生物技术公司希望____', '["基因可以获得专利。","BIO发出警告。","他们的高管积极活跃。","法官排除基因专利。"]'::jsonb, '第一段提到，联邦法官裁定基因不可获得专利时，高管们非常激动，BIO称这只是初步步骤，后来上诉法院推翻了之前的决定，允许Myriad Genetics持有基因专利，公司CEO表示该裁决对公司和患者都是福音。这表明公司希望基因可以获得专利。因此A正确。B项错误，BIO是行业组织，并未发出警告，而是安抚成员。C项错误，高管们是“violently agitated”，并非“active”。D项错误，公司希望法官支持基因专利，而非排除。'),
  (32, 1, '反对基因专利的人认为____', '["基因检测不可靠。","只有人造产品才可以获得专利。","基因专利很大程度上依赖于创新。","法院应限制基因检测的使用。"]'::jsonb, '反对者认为基因是自然的产物，因此不应被授予专利，这意味着只有人造产品才可专利。因此B正确。A项错误，文中未提及基因检测不可靠。C项错误，反对者认为基因专利抑制创新而非奖励创新。D项错误，反对者认为专利垄断限制了基因检测的可及性，而非要求法院限制。'),
  (33, 0, '根据Hans Sauer的说法，公司渴望获得____的专利。', '["发现基因相互作用。","建立疾病相关性。","绘制基因图谱。","识别人类DNA。"]'::jsonb, '文中提到，公司正在研究基因如何相互作用，寻找可能用于确定疾病原因或预测药物疗效的相关性。Hans Sauer解释说，公司渴望获得“连接点”的专利，即发现基因相互作用。因此A正确。B项“建立疾病相关性”是研究的一部分，但更具体的是基因相互作用。C项和D项均不准确，文中未提及绘制基因图谱或识别人类DNA。'),
  (34, 2, '作者说“Each meeting was packed”（第六段）的意思是____', '["最高法院具有权威性。","BIO是一个强大的组织。","基因专利问题备受关注。","律师们热衷于参加会议。"]'::jsonb, '第六段提到，BIO最近召开了一次会议，包括指导律师应对专利格局变化的会议，每个会议都挤满了人。这表明基因专利问题引起了广泛关注，因此C正确。A项错误，会议与最高法院无关。B项错误，会议爆满不能直接说明BIO强大。D项错误，虽然律师参加，但重点在于问题本身受关注，而非律师的爱好。'),
  (35, 3, '总的来说，作者对基因专利的态度是____', '["批评的。","支持的。","轻蔑的。","客观的。"]'::jsonb, '作者在文章中客观陈述了基因专利的争议，包括支持方和反对方的观点，以及法院的裁决和未来可能的发展，没有表现出明显的倾向性。因此D正确。A、B、C均不符合作者中立的态度。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2012 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2012 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 3, '通过说“寻找一线希望”（第二段），作者暗示失业者试图____', '["从政府寻求补贴。","从陷入困境的经济中获利。","探索失业的原因。","看到经济衰退的积极面。"]'::jsonb, '正确项D。原文中“find silver linings”意为寻找困境中的积极方面，且后文提到失业者说失业“improved them in some ways”，如变得不那么物质、更节俭等，说明他们试图看到衰退的积极面。A、B、C均未在原文提及，且与上下文不符。'),
  (37, 3, '根据第二段，经济衰退使人们____', '["互相争斗。","实现国家梦想。","挑战他们的节俭。","重新考虑他们的生活方式。"]'::jsonb, '正确项D。第二段提到衰退“awoken us from our national fever dream of easy riches and bigger houses, and put a necessary end to an era of reckless personal spending”，即唤醒了人们并结束了挥霍时代，促使人们反思生活方式。A、B、C均与原文不符。'),
  (38, 1, '本杰明·弗里德曼认为经济衰退可能____', '["给移民带来更重的负担。","暴露更多人性之恶。","促进权利和自由的进步。","缓解种族和阶级之间的冲突。"]'::jsonb, '正确项B。原文提到弗里德曼认为长期经济停滞或衰退“almost always left society more mean-spirited and less inclusive, and have usually stopped or reversed the advance of rights and freedoms”，即社会更吝啬、更不包容，权利进步受阻，这体现了人性中恶的一面。A未提及；C与原文相反；D与原文相反，原文说反移民情绪和种族阶级冲突增加。'),
  (39, 3, '蒂尔·冯·瓦赫特的研究表明，在经济衰退中，精英大学的毕业生倾向于____', '["由于机会减少而落后于其他人。","迅速赶上经验丰富的员工。","看到他们的生活机会和其他人一样暗淡。","比其他人恢复得更快。"]'::jsonb, '正确项D。原文说“those with degrees from elite universities catch up fairly quickly to where they otherwise would have been”，即他们很快赶上原本应有的状态，而“the masses beneath them are left behind”，说明他们比其他人恢复更快。A与原文相反；B未提及“经验丰富的员工”；C与原文相反，原文说他们的机会并未暗淡。'),
  (40, 2, '作者认为困难时期对社会的影响是____', '["微不足道的。","积极的。","确定的。","破坏性的。"]'::jsonb, '正确项C。最后一段作者说“We will have to wait and see exactly how these hard times will reshape our social fabric. But they certainly will reshape it”，即影响是确定的，只是具体方式未知。A与“certainly”矛盾；B过于片面，作者认为影响可能有好有坏；D未明确，作者未说一定是破坏性的。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2012 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2013 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 0, '第一段中的笑话被用来说明____', '["技术进步的影响。","工作压力的减轻。","纺织厂的缩减。","中产阶级收入的下降。"]'::jsonb, '笑话描述现代纺织厂高度自动化，只有两个人（一个人和一条狗），人负责喂狗，狗防止人碰机器，这形象地说明了机器取代了人工，体现了技术进步对就业的影响。因此正确选项为A。B项“工作压力的减轻”与笑话无关；C项“纺织厂的缩减”是表面现象，不是笑话要说明的核心；D项“中产阶级收入的下降”在第二段提到，但不是笑话的意图。'),
  (22, 2, '根据第三段，要成为一名成功的员工，一个人必须____', '["采取平均的生活方式。","从事廉价软件工作。","贡献独特的东西。","要求适中的薪水。"]'::jsonb, '第三段明确指出“everyone needs to find their extra — their unique value contribution that makes them stand out”，即每个人需要找到自己的额外价值，做出独特的贡献，使自己脱颖而出。因此正确选项为C。A项“平均的生活方式”与原文“average is officially over”矛盾；B项“从事廉价软件工作”是雇主可获得的资源，不是员工成功的条件；D项“要求适中的薪水”未提及。'),
  (23, 1, '第四段中的引文解释了____', '["技术的收益已被抹去。","工作机会正在高速消失。","工厂赚的钱比以前少得多。","新的工作和服务已被提供。"]'::jsonb, '引文提到“factories shed workers so fast that they erased almost all the gains of the previous 70 years; roughly one out of every three manufacturing jobs — about 6 million in total — disappeared”，说明制造业工作岗位大量快速消失，因此正确选项为B。A项“技术的收益已被抹去”是对“erased gains”的误解，这里指就业岗位的消失；C项“工厂赚的钱少”未提及；D项“新的工作和服务”在第五段提到，但引文本身强调的是岗位消失。'),
  (24, 1, '根据作者的观点，为了减少失业，最重要的是____', '["加速信息技术革命。","确保人们获得更多教育。","推进经济全球化。","在21世纪通过更多法案。"]'::jsonb, '最后一段指出“nothing would be more important than passing some kind of G.I.Bill for the 21st century that ensures that every American has access to post-high school education”，即最重要的是确保每个人都能接受高中后教育。因此正确选项为B。A项“加速信息技术革命”和C项“推进经济全球化”是导致失业的原因，不是解决措施；D项“通过更多法案”是手段，但核心是教育法案，且“更多”不准确。'),
  (25, 3, '以下哪项最适合作为本文的标题？', '["技术变得廉价。","新法律生效。","经济衰退是坏事。","平庸时代已结束。"]'::jsonb, '文章反复强调“average is officially over”，并围绕这一主题展开，指出平庸不再能带来过去的生活，人们需要独特贡献和教育。因此正确选项为D。A项“技术变得廉价”是背景之一，不是主题；B项“新法律生效”是建议，不是全文重点；C项“经济衰退是坏事”只是原因之一，不全面。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2013 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2013 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 3, '“候鸟”指的是那些____的人。', '["在海外找到永久工作","永远离开自己的祖国","跨越大西洋移民","在外国暂时停留"]'::jsonb, '根据原文第一段，候鸟指的是那些没有打算永久居留，赚了钱就回国的人，如意大利移民最终返回意大利。因此，他们是在外国暂时停留的人。选项A、B、C均与原文描述不符。'),
  (27, 2, '第二段暗示，美国当前的移民体系____。', '["需要新的移民类别","已经放松了对移民的控制","应该适应以应对挑战","已经通过政治手段修复"]'::jsonb, '第二段指出，当前的移民体系“破碎”，政治僵局长期存在，作者认为“我们不需要更多类别，但需要改变思考类别的方式”，并建议“超越合法与非法的严格定义”，以解决移民挑战。因此，体系需要调整以适应挑战。选项A与原文“不需要更多类别”矛盾；B和D与原文描述的“破碎”和“僵局”不符。'),
  (28, 3, '根据作者，今天的候鸟想要____。', '["经济激励","全球认可","获得固定工作的机会","来去自由"]'::jsonb, '原文提到，今天的候鸟“喜欢随着机会的召唤来去自如”，他们希望在美国能短暂工作而不必承诺永久居留，并希望感觉家可以在这里也可以在那里。因此，他们想要的是来去自由。选项A、B、C在原文中没有直接提及或与原文不符。'),
  (29, 1, '作者建议，今天的候鸟应该被____对待。', '["作为忠实的伙伴","在法律上宽容","给予经济优惠","作为强大的对手"]'::jsonb, '作者认为，需要超越合法与非法的严格定义，承认那些在灰色地带生活和发展的人，并理解管理移民需要多种路径和结果，包括在现有体系中不易合法实现的情况。这暗示应给予法律上的宽容。选项A、C、D在原文中没有依据。'),
  (30, 2, '这篇文章最合适的标题是____。', '["来去：大错误","生活与发展：大风险","合法或非法：大错误","有或无：大风险"]'::jsonb, '文章批评了将移民简单分为合法或非法的二元框架，认为这种框架导致了移民体系的破碎和政治僵局，并建议超越这种分类。因此，标题“合法或非法：大错误”最能概括主旨。选项A、B、D未能准确反映文章核心。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2013 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2013 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 0, '做决定所需的时间可能____', '["根据情况的紧急程度而变化。","证明我们大脑反应的复杂性。","取决于评估的重要性。","预先决定我们判断的准确性。"]'::jsonb, '原文提到，对于判断某人是否危险，我们的大脑和身体会在几毫秒内快速反应，但评估其他因素需要更多时间，例如判断某人是否善于社交至少需要一分钟。这表明决策时间因情况而异，紧急情况下反应快，非紧急情况需要更多时间。因此A正确。B项未提及大脑反应的复杂性；C项未提及评估的重要性；D项未提及时间预先决定判断准确性。'),
  (32, 0, '我们对快餐标志的反应表明，快速决策____', '["可以是联想性的。","不是无意识的。","可能是危险的。","不是冲动的。"]'::jsonb, '原文指出，看到快餐标志会让我们无意识地将快餐与速度和急躁联系起来，并将这些冲动带入其他活动中，例如阅读速度加快或觉得音乐太长。这表明快速决策与联想有关。因此A正确。B错误，因为原文说“无意识地将快餐与速度联系起来”；C项在原文中未提及快餐标志的危险性；D错误，因为原文提到“携带这些冲动”。'),
  (33, 2, '为了逆转快速决策的负面影响，我们应该____', '["相信我们的第一印象。","像人们通常做的那样。","在行动之前思考。","寻求专家建议。"]'::jsonb, '原文提到，如果我们知道会对消费品或住房选择过度反应，可以在购买前花点时间思考；如果我们知道女性筛选者可能拒绝漂亮的女性申请人，可以帮助她们理解偏见或聘请外部筛选者。这些例子都表明在行动前暂停思考可以逆转负面影响。因此C正确。A与原文相反，原文建议不要依赖快速反应；B未提及；D未提及专家建议。'),
  (34, 3, '约翰·戈特曼说，可靠的快速反应基于____', '["批判性评估。","“薄片”研究。","合理的解释。","充分的信息。"]'::jsonb, '原文引用戈特曼的话：“我们只有在将快速反应扎根于‘厚片’的长期研究之后，才能可靠地快速‘薄片’信息。”这意味着可靠的快速反应需要基于长期、充分的研究信息。因此D正确。A未提及；B错误，因为“薄片”研究是快速反应本身，而非基础；C未提及。'),
  (35, 2, '作者对逆转高速趋势的态度是____', '["宽容的。","不确定的。","乐观的。","怀疑的。"]'::jsonb, '原文最后说：“我们仍然有想象力去超越诱惑并逆转高速趋势。”这表明作者相信人类有能力改变，态度是积极的。因此C正确。A、B、D均不符合。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2013 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2013 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 1, '在欧洲企业职场中，通常____', '["女性占主导地位。","男性拥有最终决定权。","公司治理不堪重负。","高级管理层对家庭友好。"]'::jsonb, '根据原文第一段，欧洲企业高层职位绝大多数由男性占据，女性仅占董事会席位的14%，因此男性在职场中拥有最终决定权。A项与事实相反；C项“overwhelmed”是对“overwhelmingly male”的曲解；D项与原文“never be completely family-friendly”矛盾。'),
  (37, 1, '欧盟拟议中的立法是____', '["性别平衡的反映。","一个不情愿的选择。","对雷丁号召的回应。","一项自愿行动。"]'::jsonb, '原文提到，欧盟正在考虑立法强制董事会女性比例，这一提议源于自愿行动失败后的挫败感。雷丁本人表示不喜欢配额，但喜欢配额带来的效果，因此立法是无奈之举。A项是立法目的而非性质；C项错误，立法是对自愿行动失败的回应；D项与立法强制性质相反。'),
  (38, 0, '根据雷丁的说法，配额可能帮助女性____', '["获得高层商业职位。","看穿玻璃天花板。","平衡工作与家庭。","预见法律结果。"]'::jsonb, '原文中雷丁说配额“开辟了通往平等的道路，并打破了玻璃天花板”，并提到法国等国家通过法律强制女性进入高层职位取得了成果，因此配额帮助女性获得高层职位。B项“see through”意为“看穿”，而原文是“break through”（打破），且这只是手段而非最终目的；C项未提及；D项曲解“result”。'),
  (39, 3, '作者对雷丁呼吁的态度是____', '["怀疑。","客观。","冷漠。","赞同。"]'::jsonb, '作者理解雷丁的不情愿和挫败感，虽然不喜欢配额，但认为为了实现精英管理的理想，暂时需要强制措施，并指出四十年证据表明公司规避女性晋升，因此作者赞同雷丁的呼吁。A项与作者支持配额的态度不符；B项“客观”不如“赞同”准确，因为作者明确表达支持；C项与作者积极态度矛盾。'),
  (40, 2, '女性进入高层管理成为头条新闻，是因为缺乏____', '["更多的社会公正。","大量的媒体关注。","合适的公共政策。","更大的“软压力”。"]'::jsonb, '原文最后一句指出，如果有适当的公共政策帮助所有女性和家庭，桑德伯格就不会比其他有才能的人更具新闻价值。因此，女性成为头条是因为缺乏合适的公共政策，导致她们成为例外。A项是结果而非原因；B项与原文“吸引大量关注”矛盾；D项“软压力”已被证明无效，且不是缺乏的对象。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2013 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2014 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 1, '根据邓恩和诺顿的观点，以下哪项是最值得的购买？', '["A. 大房子。","B. 特别的旅行。","C. 时尚的汽车。","D. 丰盛的餐食。"]'::jsonb, '正确选项为B。原文第二段提到，邓恩和诺顿认为，花钱在体验上（如有趣的旅行、独特的餐食或看电影）远比物质购买更好，因为这些体验会随着时间变得更有价值。因此，特别的旅行属于体验类消费，是最值得的购买。A、C是物质消费，满意度会很快消退；D虽然属于体验，但不如旅行典型，且原文强调“有趣的旅行”等，故B更符合。'),
  (22, 0, '作者对美国看电视的态度是____', '["A. 批评的。","B. 支持的。","C. 同情的。","D. 模棱两可的。"]'::jsonb, '正确选项为A。原文第二段提到，美国人平均每年花两个月看电视，但“hardly jollier for it”（几乎没有因此更快乐），且作者建议减少看电视时间，多与朋友家人相处。这体现了作者对看电视的负面态度，即批评。B、C、D均不符合。'),
  (23, 3, '第三段提到McRib是为了表明____', '["A. 消费者有时是不理性的。","B. 流行通常出现在质量之后。","C. 营销技巧常常是有效的。","D. 稀缺性通常增加愉悦感。"]'::jsonb, '正确选项为D。原文第三段提到，麦当劳限制McRib的供应，使其成为令人痴迷的对象，这正好说明了前文观点：“奢侈品在节制消费时最令人愉悦”，即稀缺性增加愉悦感。A、B、C均未在原文中体现，且与段落主旨不符。'),
  (24, 1, '根据最后一段，Happy Money ____', '["A. 给读者留下了很多批评的空间。","B. 可能证明是值得的购买。","C. 预测了美国更广泛的收入差距。","D. 可能给读者一种成就感。"]'::jsonb, '正确选项为B。原文最后一句说“大多数人在读完这本书后会相信钱花得值”，即这本书是值得购买的。A与原文不符，因为作者认为大多数人会认同；C未提及；D“成就感”在原文中未直接关联，且最后一段强调的是“worthwhile purchase”。'),
  (25, 2, '本文主要讨论如何____', '["A. 平衡感觉良好和花钱。","B. 花费彩票赢来的大笔钱。","C. 从花出去的钱中获得持久的满足感。","D. 在奢侈品消费上变得更理性。"]'::jsonb, '正确选项为C。文章开头提出问题“如果你有5.9亿美元会怎么做”，然后介绍《快乐金钱》一书，指出如何花钱才能获得持久的满足感，如花钱在体验上、减少通勤、多陪伴家人等。A是文中提到的内容，但不是主旨；B只是引子；D只是部分内容，不全面。因此C最符合全文主旨。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2014 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2014 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 0, '根据第一段，社会心理学家发现____', '["我们的自我评价高得不切实际。","虚幻的优越感是一种毫无根据的效应。","我们对领导力的需求是不自然的。","自我提升策略是无效的。"]'::jsonb, '正确项A依据第一段：社会心理学家发现70%的人认为自己在领导力上高于平均水平，93%在驾驶上，85%在与人相处上，这些在统计上显然不可能，说明我们的自我评价过高。B项错误，因为“虚幻的优越感”是心理学家研究的现象，并非“毫无根据的效应”，原文未说其无根据。C项错误，原文未提及对领导力的需求不自然。D项错误，原文说我们自然采用自我提升策略，未说无效。'),
  (27, 2, '视觉识别被认为是人们的____', '["快速匹配。","有意识的选择。","直觉反应。","自动的自我防御。"]'::jsonb, '正确项C依据第三段：视觉识别是“自动的心理过程，快速且直觉地发生，几乎没有明显的有意识思考”，因此是直觉反应。A项“快速匹配”不准确，原文未提匹配。B项“有意识的选择”与原文“几乎没有有意识思考”矛盾。D项“自动的自我防御”原文未提防御。'),
  (28, 1, 'Epley发现自尊心更强的人倾向于____', '["低估他们的不安全感。","相信自己的吸引力。","掩盖他们的抑郁。","过度简化他们的错觉。"]'::jsonb, '正确项B依据第四段：那些认为更吸引人的照片是真实的人，与那些表现出更高自尊标志的人直接对应，说明自尊心强的人倾向于相信自己的吸引力。A项错误，原文未提低估不安全感。C项错误，原文说抑郁的人不会自我提升，但未说自尊心强的人掩盖抑郁。D项错误，原文未提过度简化错觉。'),
  (29, 0, '单词“viscerally”（第五段，第2行）在意思上最接近____', '["本能地。","偶尔地。","特别地。","攻击性地。"]'::jsonb, '正确项A依据上下文：很多人发自内心地讨厌自己的照片，因为他们不认出照片中的人，这种反应是内在的、本能的。B项“偶尔地”不符合，C项“特别地”不贴切，D项“攻击性地”无依据。'),
  (30, 3, '可以推断出Facebook是自我提升者的天堂，因为人们可以____', '["展示他们不诚实的个人资料。","定义他们的传统生活方式。","分享他们的知识追求。","隐藏他们不讨人喜欢的一面。"]'::jsonb, '正确项D依据最后一段：Facebook上人们只分享最讨人喜欢的照片，即隐藏不讨人喜欢的一面。A项错误，原文说“不是人们资料不诚实”，而是理想化版本。B项错误，原文未提传统生活方式。C项错误，分享智力追求只是其中一部分，不是主要原因。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2014 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2014 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 1, '根据第一段，经济衰退会____', '["缓解人与机器的竞争。","突出机器对人类工作的威胁。","引发痛苦的技术革命。","使我们的经济结构过时。"]'::jsonb, '第一段提到“this phenomenon tends to be most acutely felt during economic downturns”，其中“this phenomenon”指代前文的“man versus machine”，即人与机器的对抗。经济衰退时，这种对抗感受最强烈，因此会突出机器对人类工作的威胁。A项“缓解”与原文相反；C项“引发痛苦的技术革命”并非原文内容，原文说的是经济衰退期间感受强烈，而非引发革命；D项“使经济结构过时”是技术发展的结果，而非经济衰退的直接作用。'),
  (32, 0, '《与机器赛跑》的作者认为____', '["技术正在减少人类的工作机会。","自动化正在加速技术发展。","某些工作在自动化后仍将保持不变。","人类最终将赢得与机器的赛跑。"]'::jsonb, '文中提到“Since technology has such an insatiable appetite for eating up human jobs”，且该书名为《与机器赛跑》，其观点是技术会吞噬工作，即减少人类工作机会。A项正确。B项“自动化加速技术发展”文中未提及；C项与原文“jobs that were once thought to be immune from automation suddenly become threatened”矛盾；D项“人类最终获胜”与书名和内容不符，书中强调威胁。'),
  (33, 3, 'Hagel认为美国的工作通常____', '["由创新思维的人执行。","以个人风格编写脚本。","标准化且没有明确目标。","设计时违背人类创造力。"]'::jsonb, 'Hagel说美国的工作设计为“tightly scripted”和“highly standardized”，这些工作“leave no room for individual initiative or creativity”，即没有给个人主动性和创造性留空间，因此是违背人类创造力的。D项正确。A项与原文相反；B项“个人风格”与“tightly scripted”矛盾；C项“没有明确目标”文中未提，且“标准化”是事实，但“没有明确目标”无依据。'),
  (34, 3, '根据最后一段，Brynjolfsson和McAfee讨论了____', '["机器行为在实践中的可预测性。","高效进行工作的公式。","现代机器取代人类劳动的方式。","人类参与工作场所的必要性。"]'::jsonb, '最后一段提到“As Hagel notes, Brynjolfsson and McAfee indeed touched on this point in their book.”，其中“this point”指前文“we more than ever need people in the workplace who can take initiative and exercise their imagination”，即人类在工作场所需要主动性和想象力，这强调了人类参与的必要性。D项正确。A项“机器行为的可预测性”是机器设计的特点，但并非他们讨论的重点；B项“高效工作的公式”是Hagel提出的，不是他们讨论的；C项“机器取代人类劳动的方式”是他们的观点，但最后一段强调的是“augment”而非“replace”，且他们讨论的是人类参与的必要性。'),
  (35, 2, '以下哪项最适合作为本文标题？', '["如何创新我们的工作实践？","机器将取代人类劳动。","我们能赢得与机器的赛跑吗？","经济衰退刺激创新。"]'::jsonb, '文章围绕“人与机器”的竞争展开，先提出技术威胁，然后引用Hagel的观点，指出问题在于工作设计，最后提出“race with the machine”而非“race against the machine”，并探讨如何创新。标题“我们能赢得与机器的赛跑吗？”概括了文章核心议题。A项只是文章最后提出的问题，不是全文主题；B项过于绝对，文章认为机器可以增强而非完全取代；D项仅涉及第一段，不是全文主旨。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2014 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2014 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 1, '作者认为住房部门____', '["引起了广泛关注。","涉及某些政治因素。","承担了太多责任。","在经济中失去了其真正价值。"]'::jsonb, '正确项为B。原文提到“But perhaps the most significant reason is that the issue has always been so politically charged.”，说明住房问题具有政治敏感性，因此住房部门涉及政治因素。A项与原文“it is inevitable that the attention is focused elsewhere”矛盾，住房未受关注。C项原文说“To some extent the housing sector must shoulder the blame”，但并非“太多责任”。D项原文说“We have not been good at communicating the real value”，并非失去价值。'),
  (37, 2, '可以得知经济适用房____', '["增加了住房供应。","提供了支出机会。","遭受了政府偏见。","使政府失望。"]'::jsonb, '正确项为C。原文提到“It needs to put historical prejudices to one side”，表明政府过去对住房有偏见，因此经济适用房遭受了政府偏见。A项与“we are simply not building enough new homes”矛盾。B项原文提到“comprehensive spending review offers an opportunity”，但并非经济适用房提供机会。D项未提及。'),
  (38, 0, '根据第五段，乔治·奥斯本可能____', '["允许政府增加住房债务。","阻止地方政府建造房屋。","准备减少住房存量债务。","发布上调的GDP增长预测。"]'::jsonb, '正确项为A。原文提到“George Osborne...may introduce more flexibility to the current cap on the amount that local authorities can borrow against their housing stock debt.”，即可能放宽地方政府借款上限，允许更多债务。B项与原文相反，是允许借款建房。C项是放宽上限而非减少债务。D项原文提到GDP增长0.6%是如果上限被取消的结果，并非发布预测。'),
  (39, 2, '可以推断稳定的租赁环境将____', '["降低注册供应商的成本。","减少政府干预的影响。","有助于资助新开发项目。","减轻部长的责任。"]'::jsonb, '正确项为C。原文提到“creating greater certainty in the rental environment, which would have a significant impact on the ability of registered providers to fund new developments from revenues.”，即稳定的租赁环境能提高注册供应商用收入资助新开发的能力。A项未提及成本降低。B项未提及政府干预。D项未提及减轻部长责任。'),
  (40, 3, '作者认为2015年后，政府可能____', '["实施更多政策支持住房。","审查大规模公共拨款的需求。","更新经济适用房拨款计划。","停止对住房部门的慷慨资助。"]'::jsonb, '正确项为D。原文提到“the existing £4.5bn programme of grants...set to expire in 2015, is unlikely to be extended beyond then.”，即现有拨款计划2015年到期后不太可能延长，因此政府可能停止慷慨资助。A项与原文相反。B项原文说“We need to adjust to this changing climate”，并非审查需求。C项与“unlikely to be extended”矛盾。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2014 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2015 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 3, '根据第一段，大多数以前的调查发现家庭____', '["A. 是一个不现实的放松场所。","B. 比工作场所产生更多压力。","C. 是测量压力的理想场所。","D. 比工作场所提供更多的放松。"]'::jsonb, '正确项D：第一段开头提到“A new study suggests that contrary to most surveys, people are actually more stressed at home than at work.”，其中“contrary to most surveys”表明大多数以前的调查认为人们在家压力更小，即家庭比工作场所更放松。因此D正确。A项“不现实的放松场所”未提及；B项与原文相反，原文说新研究发现家庭压力更大，但以前调查相反；C项“理想测量场所”未提及。'),
  (22, 1, '根据Damaske的说法，谁最有可能在家最快乐？', '["A. 在职母亲。","B. 无子女的丈夫。","C. 无子女的妻子。","D. 在职父亲。"]'::jsonb, '正确项B：原文提到“It is men, not women, who report being happier at home than at work.”，且“the findings hold true for both those with children and without, but more so for nonparents.”，因此最快乐的是无子女的男性，即无子女的丈夫。A项在职母亲和C项无子女的妻子都是女性，她们在家压力更大；D项在职父亲虽然男性，但有子女，不如无子女的男性快乐。'),
  (23, 0, '职业女性角色的模糊指的是____', '["A. 她们既是养家糊口的人又是家庭主妇。","B. 她们的家也是放松的地方。","C. 经常有很多家务活被留下。","D. 她们很难离开办公室。"]'::jsonb, '正确项A：原文提到“For women who stay home, they never get to leave the office. And for women who work outside the home, they often are playing catch-up-with-household tasks.”，说明职业女性既要工作又要做家务，即既是养家者又是家庭主妇。B项与原文相反，家对她们不是放松的地方；C项是结果而非角色模糊本身；D项只适用于在家工作的女性，不全面。'),
  (24, 2, '单词“moola”（第四段第四行）最可能的意思是____', '["A. 能量。","B. 技能。","C. 收入。","D. 营养。"]'::jsonb, '正确项C：原文“Employee puts in hours of physical or mental labor and employee draws out life-sustaining moola.”，员工付出劳动，获得维持生活的“moola”，显然指金钱或收入。A、B、D均不符合语境。'),
  (25, 1, '家庭阵线不同于工作场所，因为____', '["A. 家几乎不是一个更舒适的工作环境。","B. 家庭中的劳动分工很少明确。","C. 家务活通常更能激励人。","D. 家庭劳动经常得到充分回报。"]'::jsonb, '正确项B：原文提到“On the home front, however, people have no such clarity. Rare is the household in which the division of labor is so clinically and methodically laid out.”，说明家庭中劳动分工不明确。A项未提及“更舒适”；C项与原文相反，家务活缺乏激励；D项与原文“inadequate rewards”相反。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2015 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2015 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 2, '招收更多第一代大学生已经____', '["降低了他们的辍学率。","缩小了成就差距。","偏离了其最初的目的。","使大学生感到压抑。"]'::jsonb, '正确选项为C。原文指出，招收第一代大学生但目睹许多人失败，意味着高等教育“继续复制和扩大，而不是缩小”基于社会阶层的成就差距，这与其最初促进经济流动的目的相悖，因此是“偏离了其最初的目的”。A项错误，因为原文说他们的辍学率更高；B项错误，因为差距并未缩小而是扩大；D项错误，原文未提及使大学生压抑。'),
  (27, 0, '研究文章的作者们乐观是因为____', '["问题是可以解决的。","他们的方法无需成本。","招生率已经提高。","他们的发现对学生有吸引力。"]'::jsonb, '正确选项为A。原文提到文章“实际上相当乐观，因为它概述了解决这个问题的潜在方法”，表明作者认为问题有解决的可能。B项错误，虽然方法接近零成本，但乐观的原因在于问题可解决，而非成本；C项和D项在原文中未提及。'),
  (28, 2, '研究表明大多数第一代大学生____', '["在私立大学学习。","来自单亲家庭。","需要经济支持。","大学学业失败。"]'::jsonb, '正确选项为C。原文提到“大多数第一代学生（59.1%）获得了佩尔助学金，这是针对有经济需求的本科生的联邦助学金”，表明他们需要经济支持。A项错误，研究在一所未命名的私立大学进行，但未说明大多数第一代学生在私立大学；B项错误，原文未提及单亲家庭；D项错误，原文未说他们大学失败，只是说他们可能面临更多挑战。'),
  (29, 3, '论文作者们相信第一代大学生____', '["实际上对成就差距漠不关心。","能对其他学生产生潜在影响。","可能缺乏申请研究项目的机会。","在处理大学问题方面缺乏经验。"]'::jsonb, '正确选项为D。原文指出，第一代学生“最缺乏的可能不是潜力，而是关于如何处理大多数大学生面临的问题的实用知识”，并且他们“难以驾驭高等教育的中产阶级文化，学习‘游戏规则’并利用大学资源”，表明他们缺乏处理问题的经验。A项错误，原文未提及他们漠不关心；B项错误，原文未提及对其他学生的影响；C项错误，原文未提及研究项目申请。'),
  (30, 3, '从最后一段我们可以推断出____', '["大学经常拒绝中产阶级文化。","学生通常因缺乏资源而受到责备。","社会阶层极大地有助于丰富教育经历。","大学对所述问题负有部分责任。"]'::jsonb, '正确选项为D。最后一段提到“因为美国高校很少承认社会阶层如何影响学生的教育经历，许多第一代学生缺乏对自己为何挣扎的洞察”，这表明大学未能承认社会阶层的影响，从而加剧了问题，因此大学对问题负有部分责任。A项错误，原文未说大学拒绝中产阶级文化，而是说学生难以适应；B项错误，原文未责备学生；C项错误，原文强调社会阶层造成差距，而非丰富经历。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2015 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2015 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 0, '根据南希·科恩的说法，办公室语言已经变得____', '["更加情绪化。","更加客观。","更少活力。","更少战略性。"]'::jsonb, '正确项为A。原文中科恩说“企业美国的通用语已经变得比20年前更加情绪化、更加右脑化”，并举例说明现在使用“旅程、使命、激情”等词汇，而过去更多使用“目标、战略、目的”，因此办公室语言变得更加情绪化。B项“更加客观”与原文相反；C项“更少活力”和D项“更少战略性”均不符合原文，因为原文提到过去有“目标、战略”，而现在更强调情感和激情。'),
  (32, 2, '以“团队”为导向的企业词汇与____密切相关', '["历史事件。","性别差异。","体育文化。","运动型高管。"]'::jsonb, '正确项为C。原文提到“让我们不要忘记体育——在男性主导的企业美国，体育仍然很重要”，并说CEO们把自己视为教练，员工是团队，因此“团队”导向的词汇与体育文化密切相关。A项“历史事件”无中生有；B项“性别差异”虽然提到男性主导，但并非直接相关；D项“运动型高管”不准确，原文说的是CEO们像教练，而非他们是运动员。'),
  (33, 3, '库拉纳认为，引入这些术语旨在____', '["复兴历史术语。","提升公司形象。","促进公司合作。","加强员工忠诚度。"]'::jsonb, '正确项为D。原文中库拉纳指出，这些术语的引入旨在“增加对公司的忠诚度”，并提到这些术语历史上与非营利组织和宗教组织相关，如愿景、价值观、激情和目的。A项“复兴历史术语”是表面现象，不是目的；B项“提升公司形象”未提及；C项“促进公司合作”与原文不符，原文强调的是员工对公司的忠诚。'),
  (34, 0, '可以推断出，《向前一步》____', '["为职业女性发声。","吸引充满激情的工作狂。","引发妈妈们之间的争论。","赞扬积极进取的员工。"]'::jsonb, '正确项为A。原文提到“妈妈战争”仍在继续，引发关于为什么女性仍然不能拥有一切的争论，以及像谢丽尔·桑德伯格的《向前一步》这样的书，其标题本身已成为流行语。因此可以推断《向前一步》与女性在工作和家庭中的平衡问题相关，为职业女性发声。B项“吸引充满激情的工作狂”无依据；C项“引发妈妈们之间的争论”不准确，争论是关于女性为何不能拥有一切，而非妈妈们之间的争论；D项“赞扬积极进取的员工”未提及。'),
  (35, 3, '关于办公室用语，以下哪项陈述是正确的？', '["管理者欣赏它但避免使用它。","语言学家认为它是胡说八道。","公司发现它是根本性的。","普通人嘲笑它但接受它。"]'::jsonb, '正确项为D。原文提到“办公室用语的讽刺之处在于：每个人都取笑它，但管理者喜欢它，公司依赖它，普通人自愿吸收它。”因此普通人嘲笑但接受它。A项“管理者欣赏但避免”错误，原文说管理者喜欢它；B项“语言学家认为它是胡说八道”不准确，原文引用语言学家的话说“你可以让人们认为它是胡说八道，同时你又相信它”，并非语言学家自己认为；C项“公司发现它是根本性的”错误，原文说公司依赖它，而非根本性。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2015 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2015 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 1, '就业图景中哪一部分被忽视了？', '["就业市场繁荣的前景。","自愿兼职工作的增加。","充分就业的可能性。","就业创造的加速。"]'::jsonb, '正确项为B。原文提到“there is another important part of the jobs picture that was largely overlooked”，随后指出“There was a big jump in the number of people who report voluntarily working part-time”，即自愿兼职人数大幅增加，这部分被忽视。A项“就业市场繁荣的前景”是文中提到的积极方面，并非被忽视的部分；C项“充分就业的可能性”是未来目标，不是被忽视的部分；D项“就业创造的加速”是文中提到的积极趋势，同样不是被忽视的部分。'),
  (37, 2, '许多人从事兼职工作是因为他们____', '["比起全职工作更喜欢兼职工作。","觉得兼职足以维持生计。","无法获得全职工作。","没有看到市场的疲软。"]'::jsonb, '正确项为C。原文明确说“Many people who work part-time jobs actually want full-time jobs. They take part-time work because this is all they can get.”，即他们想要全职但只能得到兼职，因此是因为无法获得全职工作。A项与原文“actually want full-time jobs”矛盾；B项与原文“making ends meet”困难相悖；D项未提及，且原文提到兼职增加是市场疲软的证据，但人们并非因没看到疲软而兼职。'),
  (38, 1, '美国的非自愿兼职就业____', '["比一年前更难获得。","显示出总体下降趋势。","满足了失业者的实际需求。","低于衰退前的水平。"]'::jsonb, '正确项为B。原文提到“the general direction has been down”，即总体方向是下降的。A项“更难获得”与原文不符，原文未提及获取难度；C项“满足失业者需求”错误，非自愿兼职是劳动力市场疲软的证据，并非满足需求；D项“低于衰退前水平”与原文“still far higher than before the recession”矛盾。'),
  (39, 1, '可以了解到，有了奥巴马医改，____', '["兼职者获得保险不再容易。","就业不再是获得保险的前提条件。","为家庭成员获得保险仍然具有挑战性。","全职就业对于保险仍然至关重要。"]'::jsonb, '正确项为B。原文最后一句“With Obamacare there is no longer a link between employment and insurance.”表明就业与保险不再挂钩，即就业不再是获得保险的前提。A项与原文相反，奥巴马医改使更多人获得保险；C项未提及，且原文提到医改帮助了有严重健康问题的人及其家人；D项与原文“no longer a link”矛盾。'),
  (40, 0, '本文主要讨论____', '["美国的就业。","兼职者的分类。","通过医疗补助获得保险。","奥巴马医改的麻烦。"]'::jsonb, '正确项为A。文章从就业报告谈起，讨论了兼职就业的区分、非自愿兼职的下降趋势，以及奥巴马医改对就业与保险关系的影响，整体围绕美国就业状况展开。B项“兼职者分类”只是文章部分内容，并非主旨；C项“医疗补助”是细节；D项“奥巴马医改的麻烦”未提及，文章仅讨论其影响。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2015 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2016 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 1, 'Cortina认为，早期接触计算机科学使得____更容易。', '["完成未来的工作培训。","重塑思维方式。","制定逻辑假设。","完善艺术作品制作。"]'::jsonb, '根据原文，Cortina说早期接触是有益的，年轻孩子学习计算机科学时，他们学会这不仅仅是令人困惑的字符串，而是工具，并且“It’s not as hard for them to transform their thought processes as it is for older students.” 即对他们来说转变思维过程不像年长学生那么难。因此，早期接触使重塑思维方式更容易，对应B。A未提及，C和D是具体应用，不是核心观点。'),
  (22, 3, '在为高中生授课时，Flatiron考虑了他们的____。', '["经验。","学术背景。","职业前景。","兴趣。"]'::jsonb, '原文中Flatiron的教师Victoria Friedman说：“we try to gear lessons toward things they’re interested in”，即课程针对他们感兴趣的内容，因此考虑了兴趣，对应D。其他选项未提及。'),
  (23, 0, 'Deborah Seehorn认为在Flatiron学到的技能将____。', '["帮助学生学会其他计算机语言。","当新技术出现时必须升级。","在学生找工作时需要改进。","使学生能够迅速赚大钱。"]'::jsonb, '原文中Deborah Seehorn说：“the skills they learn — how to think logically through a problem and organize the results — apply to any coding language”，即这些技能适用于任何编程语言，因此有助于学习其他计算机语言，对应A。B和C与原文矛盾，D未提及。'),
  (24, 2, '根据最后一段，Flatiron的学生预计会____。', '["与未来的程序员大军竞争。","在信息技术行业待更长时间。","为数字化的世界做好更充分的准备。","带来创新的计算机技术。"]'::jsonb, '最后一段说：“These kids are going to be surrounded by computers... The younger they learn how computers think... the better.” 强调他们未来生活中将充满电脑，越早学习越好，因此他们能更好地为数字化世界做准备，对应C。A和D不是目的，B未提及。'),
  (25, 1, '单词“coax”（第6段）最接近的意思是____。', '["挑战。","说服。","恐吓。","误导。"]'::jsonb, '原文中“how to coax the machine into producing what they want”意为如何引导机器产生他们想要的东西，coax意为“劝诱、哄”，与persuade（说服）最接近，对应B。其他选项不符合语境。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2016 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2016 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 3, '将小草原松鸡列为受威胁物种的主要原因是____', '["私人土地所有者的坚持。","对草原面积的低估。","一些生物学家的绝望呼吁。","其数量急剧减少。"]'::jsonb, '根据原文第一段，小草原松鸡的数量从200万只急剧下降到约22000只，仅占其历史分布范围的16%。这种急剧下降是美国鱼类和野生动物管理局（USFWS）决定正式将其列为受威胁物种的主要原因。因此，选项D“其数量急剧减少”正确。选项A、B、C在原文中均未提及，且不是主要原因。'),
  (27, 2, '“受威胁”标签让一些环保主义者失望，因为它____', '["是对政府压力的屈服。","会涉及更少的机构参与行动。","授予的联邦监管权力较少。","违背了保护政策。"]'::jsonb, '根据原文第二段，一些环保主义者曾推动将该鸟列为“濒危”物种，因为“濒危”状态赋予联邦官员更大的监管权力来打击威胁。而“受威胁”标签提供的权力较小，因此他们感到失望。选项C“授予的联邦监管权力较少”正确。选项A、B、D在原文中均未提及。'),
  (28, 0, '从第三段可以得知，如果无意伤害者____，他们将不会被起诉。', '["同意支付一笔赔偿金。","自愿建立同样大小的栖息地。","主动支持WAFWA的监测工作。","承诺为USFWS的运作筹集资金。"]'::jsonb, '根据原文第三段，该机构表示，只要土地所有者或企业签署了恢复草原松鸡栖息地的范围管理计划，就不会起诉那些无意杀死、伤害或干扰鸟类的人。该计划要求因运营而破坏栖息地的个人和企业支付资金，每破坏一英亩，需用2英亩新栖息地来补偿。因此，选项A“同意支付一笔赔偿金”正确。选项B、C、D在原文中未提及。'),
  (29, 3, '根据Ashe的观点，管理该物种的主导角色是____', '["联邦政府。","野生动物机构。","土地所有者。","各州。"]'::jsonb, '根据原文第四段，Ashe说：“总体想法是让各州在管理该物种方面保持主导地位。”因此，选项D“各州”正确。选项A、B、C均不是主导角色。'),
  (30, 2, 'Jay Lininger最可能支持____', '["受到质疑的计划。","双赢的说法。","环保组织。","行业团体。"]'::jsonb, '根据原文最后一段，Jay Lininger说：“联邦政府正在将管理鸟类的责任交给那些推动其灭绝的行业。”这表明他批评该计划，并反对行业团体，因此他更可能支持环保组织。选项C“环保组织”正确。选项A、B、D均与他的立场相反。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2016 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2016 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 3, '通常的时间管理技巧不起作用，因为____', '["它们能提供的并不能缓解现代人的心态。","人们经常忘记随身携带一本书。","有挑战性的书需要的是重复阅读。","深度阅读所需的条件无法得到保证。"]'::jsonb, '原文指出，通常的时间管理技巧（如放弃电视、随身带书）不足以解决问题，因为深度阅读不仅需要时间，还需要一种特殊的时间，而这种时间不能仅仅通过提高效率来获得。选项D正确，因为深度阅读所需的条件（即特殊时间）无法通过常规技巧保证。选项A错误，因为原文并未说这些技巧不能缓解现代心态，而是说它们不足以解决阅读时间问题。选项B是原文提到的建议之一，但并非原因。选项C原文未提及。'),
  (32, 1, '“空瓶子”的比喻说明人们感到有压力去____', '["更新他们的待办事项清单。","让流逝的时间变得充实。","执行他们的计划。","追求无忧无虑的阅读。"]'::jsonb, '原文中Gary Eberle用空瓶子比喻时间，说我们感到压力要填满这些不同大小的瓶子（天、小时、分钟），因为如果它们过去而没有被填满，我们就浪费了它们。这比喻说明人们感到压力要让时间充实，不要浪费。选项B正确。选项A和C是具体行为，但比喻的核心是充实时间。选项D与原文的焦虑心态相反。'),
  (33, 3, 'Eberle会同意，安排固定的阅读时间有助于____', '["促进仪式性的阅读。","鼓励效率心态。","培养在线阅读习惯。","实现沉浸式阅读。"]'::jsonb, '原文提到，Eberle指出，安排固定的阅读时间这种仪式性行为有助于我们“走出时间流”进入“灵魂时间”，从而有助于沉浸式阅读。选项D正确。选项A是手段而非目的，且原文说“such ritualistic behaviour”有助于，但问题问的是“有助于”什么，所以D更准确。选项B与原文相反，原文说这不会助长效率心态。选项C原文未提及。'),
  (34, 0, '“随身携带一本书”如果____就能起作用。', '["阅读成为你一天中的主要事务。","所有日常事务都已及时处理。","阅读后你能回到事务中。","时间可以平均分配给阅读和事务。"]'::jsonb, '原文说“随身携带一本书”确实有效，前提是你足够频繁地沉浸其中，使阅读成为默认状态，你暂时浮出水面处理事务，然后再回到阅读。这意味着阅读成为主要状态，事务是次要的。选项A正确。选项B和D与原文不符，原文并未要求事务处理完或平均分配。选项C是结果，但前提是阅读成为默认状态，所以A更准确。'),
  (35, 2, '这篇文章的最佳标题可能是____', '["如何享受轻松阅读。","如何设定阅读目标。","如何找到时间阅读。","如何广泛阅读。"]'::jsonb, '文章主要讨论如何找到时间进行深度阅读，分析了常见方法的不足，并提出了有效的方法（如安排固定时间、随身带书等）。选项C准确概括了主题。选项A“轻松阅读”不准确，文章强调深度阅读。选项B“设定阅读目标”与文章观点相悖，文章反对目标导向。选项D“广泛阅读”未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2016 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2016 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 0, '跨越代际的一个成功生活的标志是____', '["组建有孩子的家庭。","尝试不同的生活方式。","超过退休年龄仍工作。","建立盈利的企业。"]'::jsonb, '根据原文第一段，“Americans continue to prize many of the same traditional milestones of a successful life, including getting married, having children, owning a home, and retiring in their sixties.” 其中“having children”是成功生活的传统标志之一，对应选项A“组建有孩子的家庭”。选项B、C、D在原文中未提及为跨代际的成功标志，因此不正确。'),
  (37, 2, '从第三段可以得知，年轻人倾向于____', '["喜欢较慢的生活节奏。","更长时间从事一份工作。","重视婚前财务。","优先考虑家庭外的儿童保育。"]'::jsonb, '第三段提到年轻人“to agree that couples should be financially secure before getting married or having children”，即同意夫妻在结婚或生育前应有经济保障，对应选项C“重视婚前财务”。选项A与原文“favor communities with more public services and a faster pace of life”矛盾，年轻人喜欢更快的生活节奏；选项B与“believe they will advance their careers most by regularly changing jobs”矛盾，年轻人认为定期换工作能促进职业发展；选项D原文未提及，且原文说“children are best served by two parents working outside the home”，并非优先考虑家庭外保育。'),
  (38, 1, '年轻人定义的优先事项和期望将____', '["很大程度上取决于政治偏好。","几乎影响美国人生活的所有方面。","关注物质问题。","变得越来越清晰。"]'::jsonb, '原文第四段指出“these contrasts suggest that ... those just starting out in life are defining priorities and expectations that will increasingly spread through virtually all aspects of American life, from consumer preferences to housing patterns to politics.” 说明这些优先事项和期望将传播到美国生活的几乎所有方面，对应选项B。选项A“取决于政治偏好”与原文不符，原文说影响政治；选项C“关注物质问题”未提及；选项D“变得越来越清晰”原文未提及。'),
  (39, 3, '年轻人和老年人都同意____', '["高薪工作更难获得。","老年人取得了更多人生成就。","如今住房贷款容易获得。","年轻人立足更加困难。"]'::jsonb, '原文第五段提到“Overwhelming majorities of both groups said they believe it is harder for young people today to get started in life than it was for earlier generations.” 即两代人都认为年轻人起步更难，对应选项D。选项A“高薪工作更难获得”是具体困难之一，但并非两代人一致同意的核心观点；选项B“老年人取得更多成就”未提及；选项C“住房贷款容易获得”与原文“finding affordable housing”和“managing debt”的困难相矛盾。'),
  (40, 1, '关于施奈德，以下哪项是正确的？', '["他认为他的技师工作相当有挑战性。","他父母的美好生活与大学学位关系不大。","他的父母认为稳定工作是成功的关键。","他大学毕业后找到了一份理想的工作。"]'::jsonb, '原文最后一段提到施奈德说“I still grew up in an upper middle-class home with parents who didn’t have college degrees”，说明他父母没有大学学位却提供了中上阶层的生活，因此选项B“他父母的美好生活与大学学位关系不大”正确。选项A“认为技师工作有挑战性”未提及；选项C“父母认为稳定工作是成功关键”未提及；选项D“找到理想工作”与原文“struggled to find a job after graduating from college”矛盾。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2016 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2017 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 0, '根据第一段，Parkrun已经____', '["获得了广泛的欢迎。","创造了许多就业机会。","加强了社区联系。","成为一个官方的节日。"]'::jsonb, '第一段提到Parkrun从十几个朋友开始，发展到英国400多个活动，海外更多，且每周六上午有超过5万人参加，这表明它非常受欢迎。因此A正确。文中提到活动免费，由志愿者组织，并未提及创造就业机会，B错误；虽然活动在公园举行，但未提及加强社区联系，C错误；活动是自发的，不是官方节日，D错误。'),
  (22, 1, '作者认为伦敦奥运会的“遗产”未能____', '["促进人口增长。","促进体育参与。","改善城市形象。","增加学校的体育课时。"]'::jsonb, '第二段指出，伦敦奥运会的承诺是让国民远离沙发，变得更健康，但实际效果不佳。虽然成年人每周运动人数增加了近200万，但人口增长更快，且现在数字加速下降。因此，奥运遗产未能促进体育参与，B正确。人口增长是客观事实，不是奥运遗产的目标，A错误；文中未提及城市形象，C错误；文中提到小学生每周至少两小时体育的人数几乎减半，说明学校体育课时并未增加，D与原文相反。'),
  (23, 2, 'Parkrun与奥运会不同之处在于它____', '["旨在发现人才。","专注于大众竞赛。","不强调精英主义。","不吸引初次参加者。"]'::jsonb, '第三段指出，Parkrun不是比赛而是计时赛，唯一对手是时钟，欢迎任何人，而奥运会申办者想培养精英运动员，强调成功而非参与，这吓退了新手。因此Parkrun不强调精英主义，C正确。Parkrun不旨在发现人才，A错误；Parkrun不是竞赛，而是个人计时，B错误；文中提到初次参加者被鼓励，D错误。'),
  (24, 3, '关于大众体育，作者认为政府应该____', '["组织“草根”体育赛事。","监督地方体育协会。","增加对体育俱乐部的资金。","投资公共体育设施。"]'::jsonb, '第四段指出，政府的作用应该是提供公共物品——确保有运动场地的空间和资金来铺设网球场和无挡板篮球场，并鼓励学校提供这些活动。因此D正确。政府不应参与组织草根活动，A错误；文中未提及监督地方体育协会，B错误；文中未提及增加对体育俱乐部的资金，C错误。'),
  (25, 1, '作者对英国政府为体育所做事情的态度是____', '["容忍的。","批评的。","不确定的。","同情的。"]'::jsonb, '第四段指出，历届政府出售绿地、削减地方当局资金、忽视体育教育，作者认为未来政府需要做更多提供体育繁荣的条件，或至少不要使情况更糟。这表达了批评态度，因此B正确。其他选项不符合。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2017 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2017 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 1, '根据Jenny Radesky的观点，数字产品被设计用来____', '["简化日常事务。","吸引用户的注意力。","改善人际关系。","提高工作效率。"]'::jsonb, '正确项为B。原文中Radesky说“Tech is designed to really suck you in”和“digital products are there to promote maximal engagement”，表明数字产品旨在最大限度地吸引用户投入，即吸收用户注意力。A、C、D在原文中未提及，且与“suck you in”和“maximal engagement”不符。'),
  (27, 3, 'Radesky的食品测试实验表明，母亲使用设备____', '["夺走婴儿的食欲。","分散孩子的注意力。","减缓婴儿的语言发展。","减少了母子间的交流。"]'::jsonb, '正确项为D。原文提到“mothers who used devices during the exercise started 20 percent fewer verbal and 39 percent fewer nonverbal interactions with their children”，说明使用设备减少了母亲与孩子的互动交流。A、B、C在原文中未提及，实验关注的是互动频率而非食欲、注意力或语言发展速度。'),
  (28, 3, 'Radesky引用“静止面孔实验”是为了表明____', '["孩子容易习惯面无表情。","语言表达对情感交流不是必需的。","孩子对父母情绪的变化不敏感。","父母需要回应孩子的情感需求。"]'::jsonb, '正确项为D。原文中Radesky引用实验后说“parents need to be responsive and sensitive to a child’s verbal or nonverbal expressions of an emotional need”，表明父母应回应孩子的情感需求。实验显示孩子因母亲无反应而痛苦，说明孩子对父母反应敏感，故A、C错误；B与原文不符，原文强调非语言交流的重要性。'),
  (29, 2, 'Tronick提到的“压迫性意识形态”要求父母____', '["保护孩子免受狂野幻想的侵害。","每年至少教孩子3万个单词。","确保与孩子持续互动。","继续担心孩子使用屏幕。"]'::jsonb, '正确项为C。原文中Tronick说这种意识形态“demands that parents should always be interacting” with their children，即要求父母始终与孩子互动。A、D未提及；B是这种意识形态的一个例子，但并非其核心要求，且原文说“expose your child to 30,000 words”并非“teach”，且是举例说明，不是要求本身。'),
  (30, 0, '根据Tronick的观点，孩子使用屏幕可能____', '["给父母一些空闲时间。","让父母更有创造力。","帮助孩子完成作业。","帮助孩子变得更专注。"]'::jsonb, '正确项为A。原文提到“particularly if it gives parents time to have a shower, do housework or simply have a break from their child”，说明孩子使用屏幕可以给父母提供休息或做家务的时间。B、C、D在原文中未提及，Tronick只提到屏幕对孩子可能没有学习价值，但未说有助于作业或专注力。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2017 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2017 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 2, '高中毕业生不选择间隔年的原因之一是____', '["他们认为这在学术上具有误导性。","他们期待大学里有很多乐趣。","与别人不同让他们感到奇怪。","参加校外课程似乎没有价值。"]'::jsonb, '根据原文第一段，学生不选择间隔年是因为“如果你认识的每个人都在秋天上大学，那么推迟一年似乎很愚蠢”，并且“在上了12年学之后，花一年时间做非学术的事情感觉不自然”。这反映了与别人不同会感到奇怪，因此选项C正确。选项A、B、D在原文中未提及，且与原文表述不符。'),
  (32, 3, '美国和澳大利亚的研究表明，间隔年有助于____', '["使学生避免不切实际。","降低职业选择的风险。","减轻新生的经济负担。","缓解新生的压力。"]'::jsonb, '根据原文第三段，美国和澳大利亚的研究表明，间隔年学生通常准备更充分，大学表现更好。间隔年经历可以“减轻适应大学和进入全新环境的冲击”，使学生更容易专注于学业和活动，而不是适应上的失误。这有助于缓解新生的压力，因此选项D正确。选项A、B、C在原文中未提及。'),
  (33, 0, '单词“acclimation”（第3段）在意思上最接近____', '["适应。","申请。","动机。","竞争。"]'::jsonb, '根据原文第三段，“acclimation blunders”指的是适应新环境时的失误，结合上下文，间隔年经历使适应大学和全新环境更容易，因此“acclimation”意为“适应”，选项A正确。其他选项不符合语境。'),
  (34, 3, '间隔年可能通过帮助学生____来省钱。', '["避免学业失败。","建立长期目标。","转到另一所大学。","决定正确的专业。"]'::jsonb, '根据原文最后一段，间隔年可以帮助学生“提前弄清楚事情”，从而防止压力并节省金钱。文中提到许多学生换专业，但换专业可能代价高昂，而间隔年可以帮助学生确定正确的专业，从而避免后期换专业带来的额外费用，因此选项D正确。选项A、B、C在原文中未提及。'),
  (35, 0, '这篇文章最合适的标题是____', '["支持间隔年。","间隔年基础知识。","间隔年回归。","间隔年：一个困境。"]'::jsonb, '全文主要论述间隔年的好处，反驳了常见的误解，认为间隔年不会阻碍学业成功，反而会提升它，并建议学生考虑间隔年。因此，文章整体是支持间隔年的，选项A正确。选项B、C、D不能准确概括文章主旨。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2017 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2017 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 1, '更频繁的野火已成为全国关注的问题，因为在2015年它们____', '["耗尽了前所未有的管理努力。","消耗了创纪录高比例的预算。","严重破坏了西部各州的生态。","导致基础设施支出大幅上升。"]'::jsonb, '根据原文，2015年美国林务局首次将55亿美元年度预算的一半以上用于灭火，这一比例是20年前的两倍，因此选项B正确。选项A“耗尽了前所未有的管理努力”未提及；选项C“严重破坏了西部各州的生态”虽野火是问题，但原文强调全国关注是因为对联邦税收的影响；选项D“导致基础设施支出大幅上升”与原文不符，原文提到基础设施维护资金减少。'),
  (37, 3, '莫里茨呼吁使用“放大镜”来____', '["为火灾多发地区筹集更多资金。","避免联邦资金的重新分配。","找到无野火风险的景观区域。","确保公共资金更安全地支出。"]'::jsonb, '莫里茨说“我们需要用放大镜来看待这个问题”，并质疑将联邦资金用于建造可能被野火烧毁的房屋是否合适，是否应该将资金重新引导到低风险地区，这体现了确保公共资金更安全支出的意图，因此选项D正确。选项A“筹集更多资金”未提及；选项B“避免重新分配”与原文相反，莫里茨建议重新引导资金；选项C“找到无野火风险的区域”是手段而非目的，且原文是“低风险”而非“无风险”。'),
  (38, 2, '虽然承认气候是一个关键因素，莫里茨指出____', '["公众辩论尚未解决。","灭火条件正在改善。","其他因素不应被忽视。","对火的看法已经发生了转变。"]'::jsonb, '莫里茨说气候是关键因素，但不应以牺牲等式其余部分为代价，即其他因素如人类系统和景观也很重要，不应被忽视，因此选项C正确。选项A“公众辩论尚未解决”未提及；选项B“灭火条件正在改善”未提及；选项D“对火的看法已经发生转变”与原文不符，原文提到需要转变，但尚未发生。'),
  (39, 3, '莫里茨提到的过于简化的观点是未能____的结果', '["发现自然的基本构成。","探索人类系统的机制。","最大化景观在人类生活中的作用。","理解人与自然的相互关系。"]'::jsonb, '莫里茨指出，未能认识到人类系统和景观是相互联系的，相互作用是双向的，会导致对问题及解决方案的看法过于局限，即过于简化的观点源于未能理解人与自然的相互关系，因此选项D正确。选项A“发现自然的基本构成”未提及；选项B“探索人类系统的机制”不完整，只涉及人类系统；选项C“最大化景观的作用”未提及。'),
  (40, 1, '巴尔奇教授指出，火是人类应该____的东西', '["废除。","接受。","付出代价。","远离。"]'::jsonb, '巴尔奇说承认火在人类生活中不可避免的存在是制定法律、政策和实践的关键态度，并提到“我们已经将自己与火共存的生活隔离开来”，因此人类应该接受火的存在，即“come to terms with”，选项B正确。选项A“废除”与原文相反；选项C“付出代价”未提及；选项D“远离”与原文相反，原文强调与火共存。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2017 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2018 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 1, '提到坏掉的自行车链条是为了表明学生缺乏____', '["学术训练。","实践能力。","开拓精神。","机械记忆。"]'::jsonb, '正确选项为B。原文第一段提到，在新罕布什尔州的这所高中，学习不是书本、考试和机械记忆，而是实用的。接着问“什么时候成为公认的智慧，学生应该能说出美国第13任总统的名字，却完全被坏掉的自行车链条难倒？”这里用坏链条的例子说明学生缺乏实践能力，而非学术训练、开拓精神或机械记忆。因此选B。'),
  (22, 3, '存在一种偏见，认为职业教育是为那些____的孩子准备的。', '["思维刻板。","没有职业动力。","经济困难。","学业不成功。"]'::jsonb, '正确选项为D。原文第二段提到，职业教育学校有那种刻板印象，“认为它是为那些在学业上无法成功（can''t make it academically）的孩子准备的”。因此，偏见是认为职业教育针对学业不成功的学生。A选项“思维刻板”是偏见本身，不是针对对象；B和C未提及。故选D。'),
  (23, 0, '从第五段可以推断，高中毕业生____', '["过去有更多的工作机会。","过去有大的财务担忧。","有权获得更多的教育特权。","不愿意在制造业工作。"]'::jsonb, '正确选项为A。第五段提到“美国经济曾经提供给高中毕业生的就业保障基本上已经消失”（The job security that the US economy once offered to high school graduates has largely evaporated），暗示过去高中毕业生有更多的工作机会和保障。B、C、D在文中没有依据。故选A。'),
  (24, 2, '盲目推动所有人都获得学士学位____', '["有助于创造许多中等技能工作。","可能缩小工人阶级工作的差距。","表明对高等教育的过度重视。","有望产生更训练有素的劳动力。"]'::jsonb, '正确选项为C。原文第六段提到“盲目推动所有人都获得学士学位——以及对任何低于此的微妙贬低——错过了一个重要观点”，这暗示了对学士学位的过度追求，即对高等教育的过度重视。A和D与原文不符，原文指出中等技能工作存在缺口，但工人未受足够培训；B与原文相反，原文说存在差距，但盲目追求学位不能缩小差距。故选C。'),
  (25, 2, '作者对Koziatek学校的态度可以描述为____', '["容忍的。","谨慎的。","支持的。","失望的。"]'::jsonb, '正确选项为C。文章最后一段说“Koziatek的学校是一个警钟”，并指出当教育变得一刀切时，它可能忽视国家才能的多样性。这暗示作者对Koziatek学校持肯定和支持态度，认为它填补了工人阶级工作的差距。因此选C。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2018 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2018 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 2, '单词“plummeting”（第2段）在意思上最接近____', '["稳定。","变化。","下降。","上升。"]'::jsonb, '原文提到“the plummeting prices of renewables”，并举例说太阳能电池板成本下降80%，风力涡轮机成本下降近三分之一，因此“plummeting”意为“急剧下降”。选项C“falling”符合。A“stabilizing”意为稳定，与下降相反；B“changing”过于宽泛；D“rising”与下降相反。'),
  (27, 0, '根据第3段，美国可再生能源的使用____', '["正在显著进步。","与欧洲一样广泛。","面临许多挑战。","已被证明不切实际。"]'::jsonb, '第3段提到“the United States is also seeing a remarkable shift”，并举例说3月份风能和太阳能发电量首次超过美国发电量的10%，说明美国可再生能源使用显著进步。A正确。B错误，原文说“the rest of the world takes the lead, notably China and Europe”，暗示美国不如欧洲广泛；C和D与原文积极态度不符。'),
  (28, 0, '可以了解到，在爱荷华州，____', '["风能是一种广泛使用的能源。","风能已经取代了化石燃料。","科技巨头正在投资清洁能源。","清洁能源供应短缺。"]'::jsonb, '原文提到爱荷华州“wind turbines dot the fields and provide 36 percent of the state’s electricity generation”，说明风能广泛使用。A正确。B错误，36%不等于完全取代；C错误，原文说科技巨头被清洁能源吸引，并非投资；D错误，原文说清洁能源可用。'),
  (29, 2, '根据第5段和第6段，关于清洁能源以下哪项是正确的？', '["它的应用促进了电池存储。","它常用于汽车制造。","它的持续供应正在成为现实。","它的可持续开发仍将困难。"]'::jsonb, '第5-6段提到“a boost in the storage capacity of batteries is making their ability to keep power flowing around the clock more likely”，说明电池存储能力的提升使清洁能源的持续供应更可能成为现实。C正确。A因果颠倒，是电池存储提升促进清洁能源应用；B错误，原文说电动汽车仍罕见；D与原文“more likely”矛盾。'),
  (30, 2, '从最后一段可以推断出可再生能源____', '["将使美国更接近其他国家。","将加速全球环境变化。","并未真正受到美国政府的鼓励。","在成本方面不够有竞争力。"]'::jsonb, '最后一段提到“What Washington does — or doesn’t do — to promote alternative energy may mean less and less”，暗示美国政府（华盛顿）对可再生能源的支持不足，且其行动影响减弱。C正确。A错误，原文未提及美国接近他国；B错误，原文说可再生能源有助于减缓气候变化；D错误，原文强调成本下降。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2018 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2018 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 1, '根据第一段，Facebook收购WhatsApp是为了其____', '["数字产品。","用户信息。","实物资产。","优质服务。"]'::jsonb, '正确选项为B。第一段提到WhatsApp提供给Facebook的是其用户友谊和社交生活的精细网络，即用户信息。A错误，WhatsApp没有实物产品，且其价值不在数字产品本身；C错误，WhatsApp没有实物资产；D错误，文中未提及服务质量。'),
  (32, 2, '将电话号码与Facebook身份关联可能____', '["加剧政治争端。","搞乱客户记录。","对Facebook用户构成风险。","误导欧盟委员会。"]'::jsonb, '正确选项为C。第一段指出Facebook承诺不关联电话号码与身份，但违背承诺，且知道谁发送给谁极具揭示性，可能暴露用户隐私，对用户构成风险。A错误，文中提及政治记者可能想知道群组构成，但未说关联会加剧政治争端；B错误，客户记录与用户数据无关；D错误，误导欧盟委员会是违背承诺的结果，但风险是对用户的。'),
  (33, 3, '根据作者观点，竞争法____', '["应该服务于新的市场力量。","可能加剧经济不平衡。","不应只提供一种法律解决方案。","无法跟上市场的变化。"]'::jsonb, '正确选项为D。第二段指出竞争法相对于数字经济变化速度缓慢，问题解决时可能已消失。A错误，作者未说竞争法应服务于新市场力量；B错误，文中说竞争法解决不平衡，但未说加剧；C错误，文中未提及法律解决方案的数量。'),
  (34, 0, '目前解释的竞争法难以保护Facebook用户，因为____', '["他们未被定义为客户。","他们在经济上不可靠。","服务通常是数字化的。","服务由广告商付费。"]'::jsonb, '正确选项为A。第二段指出竞争法处理消费者的经济损失，但用户不付费，因此不是客户，而是广告商是客户。B错误，文中未提及经济可靠性；C错误，数字化不是原因；D错误，广告商付费是事实，但根本原因是用户不被视为客户。'),
  (35, 3, '蚂蚁类比用于说明____', '["数字巨头之间的双赢商业模式。","数字巨头之间的典型竞争模式。","为数字巨头的客户提供的好处。","数字巨头与其用户之间的关系。"]'::jsonb, '正确选项为D。第三段将谷歌比作蚂蚁，用户比作蚜虫，说明谷歌从用户数据中获益，同时提供保护，类似蚂蚁与蚜虫的关系，即数字巨头与用户的关系。A错误，类比未涉及数字巨头之间的模式；B错误，未涉及竞争；C错误，用户不是客户，且类比强调巨头受益。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2018 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2018 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 0, '掌握深度工作艺术的关键是____', '["坚持你的专注时间。","列出你立即要完成的任务。","制定具体的每日计划。","抓住每一分钟去工作。"]'::jsonb, '原文提到“Whichever approach, the key is to determine your length of focus time and stick to it.”，即无论哪种方法，关键是确定你的专注时间长度并坚持。因此A项正确。B项“列出立即任务”是另一种提高效率的方法，但不是关键；C项“制定具体每日计划”在文中被批评为可能降低动力；D项“抓住每一分钟工作”与文中提倡的“懒惰”和休息相悖。'),
  (37, 3, '哈福德引用的20世纪80年代初的研究表明____', '["分心实际上可能提高效率。","每日时间表对学习必不可少。","学生很少被月度目标激励。","详细的计划可能不如预期那样有成效。"]'::jsonb, '原文指出，研究人员假设结构良好的每日计划最有效，但结果相反：“the detailed daily plans demotivated students”，即详细的每日计划使学生失去动力。因此D项正确。A项是哈福德的观点，但研究本身并未直接证明分心提高效率；B项与研究发现相悖；C项文中未提及月度目标对学生的激励作用。'),
  (38, 3, '根据纽波特的观点，闲散是____', '["忙碌的人理想的精神状态。","身体健康的主要贡献者。","节省时间和精力的有效方法。","完成任何工作的必要因素。"]'::jsonb, '原文中纽波特说：“Idleness is ... indispensable to the brain as vitamin D is to the body... necessary to getting any work done”，即闲散对大脑不可或缺，对完成工作必要。因此D项正确。A项“理想精神状态”未提及；B项“身体健康”是比喻，并非直接贡献；C项“节省时间精力”与原文强调的必要性不符。'),
  (39, 1, '皮莱认为，我们大脑在专注和不专注之间的切换____', '["可以带来心理健康。","可以带来更高的效率。","旨在更好地平衡工作。","是由任务紧迫性驱动的。"]'::jsonb, '原文提到“When our brains switch between being focused and unfocused on a task, they tend to be more efficient.”，即大脑在专注和不专注之间切换时，往往更高效。因此B项正确。A项“心理健康”未提及；C项“平衡工作”不是目的；D项“任务紧迫性”文中未提及。'),
  (40, 1, '本文主要关于____', '["缓解忙碌生活压力的方法。","在更短时间内完成更多事情的方法。","消除分心的关键。","缺乏专注时间的原因。"]'::jsonb, '文章开头提出对抗忙碌陷阱，推荐深度工作，接着介绍多种方法，如深度工作、深度日程安排、重新思考优先级、利用休息时间等，核心是“getting more done in less time”。因此B项正确。A项“缓解压力”不是重点；C项“消除分心”只是部分内容；D项“缺乏专注时间的原因”未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2018 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2019 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 0, '研究人员认为内疚可能是好事，因为它可能有助于____', '["调节儿童的基本情绪。","培养儿童的道德发展。","提高儿童的智力能力。","增强儿童的积极情感。"]'::jsonb, '正确选项为A。原文第一段指出，内疚在儿童对社交和道德规范的理解中产生，并促使他们道歉和弥补错误，这有助于道德发展。选项A“培养儿童的道德发展”符合原文。选项B“调节儿童的基本情绪”不准确，因为内疚本身不是调节基本情绪，而是与道德相关。选项C“提高智力能力”和D“增强积极情感”在原文中未提及。'),
  (22, 3, '根据第二段，许多人仍然认为内疚是____', '["沉重的。","欺骗性的。","上瘾的。","不可原谅的。"]'::jsonb, '正确选项为A。第二段提到“It is deeply uncomfortable — it''s the emotional equivalent of wearing a jacket weighted with stones.”，表明内疚像穿着沉重的夹克，令人不适，因此是“沉重的”。选项B“欺骗性的”、C“上瘾的”和D“不可原谅的”均未在原文中体现。'),
  (23, 1, 'Vaish认为，对内疚的重新思考源于一种认识，即____', '["情绪是独立于情境的。","情绪是社会建构的。","一种情绪可以扮演相反的角色。","情绪稳定有益于健康。"]'::jsonb, '正确选项为C。第三段Vaish说“emotions aren''t binary — feelings that may be advantageous in one context may be harmful in another”，表明情绪不是二元的，一种情绪在不同情境下可能有利或有害，即可以扮演相反的角色。选项A“独立于情境”与原文相反；B“社会建构”不是Vaish强调的重点；D“情绪稳定有益健康”未提及。'),
  (24, 1, 'Malti和其他人已经表明，合作和分享____', '["可能源于同情或内疚。","可能有助于纠正情感缺陷。","可能带来情感满足。","可能是冲动行为的结果。"]'::jsonb, '正确选项为A。第四段提到“guilt and sympathy may represent different pathways to cooperation and sharing”，即内疚和同情是通向合作和分享的不同途径，因此合作和分享可能源于同情或内疚。选项B“有助于纠正情感缺陷”是内疚的作用，但不是合作和分享的来源；C“带来情感满足”未提及；D“冲动行为的结果”与原文不符，原文说内疚可以抑制冲动。'),
  (25, 3, '单词“transgressions”（第五段）在意思上最接近____', '["教导。","讨论。","错误行为。","限制。"]'::jsonb, '正确选项为C。第五段提到“her tendency to feel negative emotions after moral transgressions”，结合上下文，道德上的“transgressions”应指违反道德的错误行为，即“wrongdoings”。选项A“教导”、B“讨论”和D“限制”均不符合语境。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2019 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2019 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 3, '作者说“one of the harder challenges”暗示了____', '["全球气候变化可能会失控。","人们可能误解全球变暖。","森林可能成为一个潜在威胁。","极端天气条件可能出现。"]'::jsonb, '正确项为C。原文第一段提到“one of the harder challenges in the fight against climate change”，随后解释森林可能从吸收碳变为排放碳，即森林可能加剧气候变化，成为威胁。A项“气候变化失控”过于绝对，文中未提及；B项“误解”与文意不符；D项“极端天气”未在上下文中出现。'),
  (27, 3, '为了保持森林作为有价值的“碳汇”，我们可能需要____', '["保护森林中物种的多样性。","加速幼树的生长。","降低它们目前的碳吸收能力。","在不同植物之间取得平衡。"]'::jsonb, '正确项为C。原文第二段明确说“may require reducing their capacity to absorb carbon now”，即降低当前碳吸收能力。A项“物种多样性”未提及；B项“加速幼树生长”与原文“thin out young trees”相反；D项“不同植物间平衡”是干扰，原文强调“striking a subtle balance”但具体指降低碳吸收能力，而非植物间平衡。'),
  (28, 1, '加利福尼亚州的森林碳计划致力于____', '["减少其部分森林的密度。","培育更多抗旱的树木。","找到更有效的杀虫方法。","在野火后迅速恢复森林。"]'::jsonb, '正确项为A。原文第三段提到“thin out young trees and clear brush”，即间伐幼树和清除灌木，这降低了森林密度。B项“抗旱树木”未提及；C项“杀虫”是结果而非目的；D项“恢复森林”是火灾后的结果，但计划旨在预防火灾。'),
  (29, 0, '根据第五段，对加利福尼亚州的计划至关重要的是什么？', '["获得足够的财政支持。","在2020年之前实施。","完善排放许可拍卖。","优先处理严重危险的地区。"]'::jsonb, '正确项为D。原文第五段提到“it will be vital to prioritize areas at greatest risk of fire or drought”，即优先处理风险最高的地区。A项“财政支持”是资金来源，但并非“vital”；B项“2020年前实施”是时间目标，非关键；C项“拍卖”是融资方式，非关键。'),
  (30, 2, '作者对加利福尼亚州计划的态度可以最好地描述为____', '["模棱两可的。","支持的。","宽容的。","谨慎的。"]'::jsonb, '正确项为B。原文最后一段说“should serve as a model”，表明作者认为该计划应作为典范，体现支持态度。A项“模棱两可”不符；C项“宽容”不准确；D项“谨慎”未体现，作者明确肯定。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2019 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2019 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 2, '根据前两段，应该解决什么问题？', '["美国农业工人移民规定的缺陷。","美国对外国工人的歧视。","有利于某些美国企业的偏见法律。","美国农业就业机会的减少。"]'::jsonb, '正确项C对应原文第一段提到的“immigration rules for farm workers”需要“overhaul”，即移民规则需要改革，存在缺陷。A项是具体缺陷，但C项更全面。B项“歧视”和D项“就业机会减少”在原文中未提及。'),
  (32, 3, '美国农业劳动力的问题之一是____', '["非法移民数量的增加。","移民农业工人的老龄化。","农作物工人的高流动性。","缺乏有经验的劳动力。"]'::jsonb, '正确项D对应原文“They''re also aging”和“picking crops is hard on older bodies”，说明劳动力老龄化导致经验丰富但体力不足，但更直接的是“aging”问题。B项是直接原因，但D项“缺乏有经验的劳动力”是结果。A项与原文“As fewer such workers enter”相反。C项与“more likely to be settled”相反。'),
  (33, 1, '美国农业劳动力短缺的备受争议的解决方案是什么？', '["加强对农民的经济支持。","吸引更年轻的劳动力从事农业工作。","使用更多机器人种植高价值作物。","让美国本土工人重返农业。"]'::jsonb, '正确项D对应原文“Native U.S. workers won''t be returning to the farm”是“oft-debated cure”，即备受争议的解决方案。A项未提及。B项“吸引年轻人”是隐含的，但原文未直接说。C项“机械化”被否定。'),
  (34, 0, '农业雇主抱怨H-2A签证的____', '["年度准入控制。","停留时间限制。","审批程序缓慢。","要求收紧。"]'::jsonb, '正确项C对应原文“The process is cumbersome, expensive and unreliable”和“bureaucratic delays”，说明程序繁琐缓慢。A项错误，因为原文说“has no numerical cap”。B项未提及。D项未提及。'),
  (35, 1, '以下哪项可能是本文的最佳标题？', '["人力与自动化？","美国农业在衰退？","美国被墨西哥拯救？","进口食品还是劳动力？"]'::jsonb, '正确项D对应原文最后一句“In effect, the U.S. can import food or it can import the workers who pick it.”，总结了核心问题。A项只涉及机械化，不全面。B项“衰退”过于宽泛。C项“墨西哥”只是部分内容。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2019 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2019 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 1, '一些名人出演一个新视频是为了____', '["揭露塑料危机的起因。","要求制定关于塑料使用的新法律。","就塑料危机征求公众意见。","敦促消费者减少塑料的使用。"]'::jsonb, '原文提到，这些名人出演视频是“encouraging you, the consumer, to swap out your single-use plastic staples”，即鼓励消费者替换一次性塑料用品，对应D项“敦促消费者减少塑料的使用”。A项“揭露起因”未提及；B项“要求新法律”是视频中传达的信息之一，但并非名人出演视频的直接目的；C项“征求公众意见”也不符合。'),
  (37, 1, '作者担心“道德许可”可能会____', '["抑制我们对成功的渴望。","误导我们去做无价值的事情。","削弱我们的成就感。","阻止我们做出进一步的努力。"]'::jsonb, '原文指出，“moral licensing”会“eases our concerns and stops us doing more and asking more of those in charge”，即缓解我们的担忧，阻止我们做更多事，对应D项“阻止我们做出进一步的努力”。A项“抑制成功欲望”和C项“削弱成就感”均未提及；B项“误导我们做无价值的事”虽然提到“harmful”和“satisfying a need”，但核心是阻止进一步行动，而非误导做无价值的事。'),
  (38, 3, '通过指出我们作为“公民”的身份，作者表明____', '["我们一直在积极行使公民权利。","我们应该敦促政府领导这场斗争。","我们与当地产业的关系正在改善。","我们的焦点应该转移到社区福利上。"]'::jsonb, '原文说“as ''citizens'' hold our governments and industries to account to push for real systemic change”，即作为公民，我们应该要求政府和行业负责，推动真正的系统性变革，对应B项“我们应该敦促政府领导这场斗争”。A项“积极行使权利”与原文“ignoring the balance of power”不符；C项“与产业关系改善”未提及；D项“焦点转移到社区福利”偏离原文。'),
  (39, 3, 'DeSombre认为集体改变的最佳方式应该是____', '["一个双赢的安排。","一个自上而下的过程。","一个自我驱动的机制。","一个成本效益高的方法。"]'::jsonb, '原文提到DeSombre认为“the best way to collectively change the behavior of large numbers of people is for the change to be structural”，即结构性改变，并举例“implementing policy such as a plastic tax”或“banning single-use plastics”，这些是自上而下的政策，对应B项“自上而下的过程”。A项“双赢”未提及；C项“自我驱动”与结构性改变相反；D项“成本效益高”未提及。'),
  (40, 2, '作者得出结论，个人努力____', '["远远不够。","远非理性。","可能太不一致。","可能太激进。"]'::jsonb, '原文最后说“individual actions are too slow”且“We don''t have time to wait”，强调个人行动太慢，不足以应对问题，对应A项“远远不够”。B项“不理性”未提及；C项“不一致”和D项“激进”均未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2019 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2020 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 0, 'Quinn和她的同事们进行了一项测试，以了解老鼠是否能够____', '["从非生命的老鼠身上获取社会信号。","区分友好的老鼠和敌意的老鼠。","通过特殊训练获得社交特性。","向同伴发出警告信息。"]'::jsonb, '正确项A。原文第一段提到，为了探究这种能力是否延伸到非生命体，Quinn和同事测试了老鼠是否能从机器老鼠身上检测到社会信号。B项是老鼠天生需要的能力，但并非测试目的；C项文中未提及训练；D项与测试内容无关。'),
  (22, 3, '在实验过程中，不合群机器人做了什么？', '["它跟随社交机器人。","它玩了一些玩具。","它释放了被困的老鼠。","它独自移动。"]'::jsonb, '正确项D。原文第二段明确说“asocial robot simply moved forwards and backwards and side to side”，即只做前后左右移动，没有其他社交行为。A、B、C都是社交机器人的行为，而非不合群机器人的。'),
  (23, 1, '根据Quinn的说法，老鼠释放社交机器人是因为它们____', '["试图练习一种逃跑的方法。","期望机器人以后也能回报它们。","想展示它们的智力。","认为那是一个有趣的游戏。"]'::jsonb, '正确项B。原文第三段Quinn说老鼠可能因为社交机器人表现出共同探索和玩耍的行为而与其建立更紧密联系，这可能导致它们记住之前释放过它，并希望当自己被困时机器人能回报。A、C、D在文中没有依据。'),
  (24, 2, 'Janet Wiles指出，老鼠____', '["能记住其他老鼠的面部特征。","对气味的辨别比对大小的辨别更好。","对行为的反应比对长相的反应更多。","会被带轮子的塑料盒子吓到。"]'::jsonb, '正确项C。原文第四段Wiles说原本以为需要给机器人移动的头、尾巴、面部特征和气味，但发现没必要，说明老鼠对社交线索敏感，即使来自基本机器人，即更关注行为而非外观。A、B、D均与原文不符。'),
  (25, 3, '从文中可以得知，老鼠____', '["似乎能适应新环境。","比其他动物更爱社交。","在社交方面与儿童表现不同。","对社会线索比预期更敏感。"]'::jsonb, '正确项D。原文最后一段说“The finding shows how sensitive rats are to social cues, even when they come from basic robots.”，表明老鼠对社会线索的敏感程度超出预期。A项未提及；B项无比较；C项与原文“children tend to treat robots as if they are fellow beings”相似，并非不同。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2020 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2020 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 2, '以下哪项导致了CEO薪酬的上涨？', '["公司数量的增长。","经济好转带来的普遍加薪。","顶级公司商业机会的增加。","主要经济体之间的密切合作。"]'::jsonb, '原文指出“理解CEO薪酬增长的最佳模型是，在顶级公司的商业机会迅速增长的世界中，CEO人才有限”，这表明顶级公司商业机会的增加是CEO薪酬上涨的原因之一。因此C项正确。A项“公司数量增长”未提及；B项“普遍加薪”与原文强调的CEO相对其他工人表现更好不符；D项“主要经济体合作”未提及。'),
  (27, 3, '与前任相比，如今的CEO被要求____', '["培养更强的团队合作意识。","资助更多的研发。","与科技公司建立更紧密的联系。","经营更加全球化的公司。"]'::jsonb, '原文提到“大型美国公司比以往任何时候都更加全球化，供应链遍布更多国家”，因此CEO需要领导这种全球体系，所以D项正确。A项“团队合作”未提及；B项“资助研发”是公司行为，不是CEO个人要求；C项“与科技公司建立联系”不准确，原文说“几乎所有大公司都变成科技公司”，而非与科技公司合作。'),
  (28, 1, '尽管____，CEO薪酬自20世纪70年代以来一直在上涨。', '["持续的内部反对","严格的公司治理","保守的商业策略","政府的反复警告"]'::jsonb, '原文指出“自20世纪70年代以来，公司治理变得更加严密和严格，然而正是在这个治理更强的时期，CEO薪酬一直很高且不断上升”，因此B项正确。A项“内部反对”未提及；C项“保守策略”与原文相反；D项“政府警告”未提及。'),
  (29, 3, '高CEO薪酬的合理性在于它有助于____', '["确认CEO的地位。","激励内部候选人。","提高CEO的效率。","增加公司价值。"]'::jsonb, '原文最后提到“当公司将CEO薪酬与股价挂钩时，股市反应积极，这表明这些做法不仅为CEO，也为公司创造了价值”，因此高薪酬有助于增加公司价值，D项正确。A项“确认地位”未提及；B项“激励内部候选人”与原文“最高薪酬付给外部候选人”矛盾；C项“提高效率”未提及。'),
  (30, 0, '最适合本文的标题是____', '["CEO薪酬并不过高","CEO薪酬：过去与现在","当今CEO的挑战","CEO特质：难以定义"]'::jsonb, '全文主要论证CEO高薪的合理性，反驳“CEO薪酬过高”的观点，因此A项“CEO薪酬并不过高”最合适。B项“过去与现在”只是部分内容；C项“挑战”是论据之一；D项“特质”未重点讨论。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2020 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2020 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 3, '关于马德里的清洁空气区，以下哪项是正确的？', '["其效果令人质疑。","它已被一名法官反对。","它需要更严格的执行。","它的命运尚未决定。"]'::jsonb, '原文提到马德里清洁空气区因新市长暂停执行，法官又恢复罚款，但法律斗争仍在继续，其未来不确定。因此D项“它的命运尚未决定”正确。A项“效果令人质疑”与原文“成功改善空气质量”矛盾；B项“被法官反对”不准确，法官是反对停止罚款；C项“需要更严格执法”未提及。'),
  (32, 3, '哪一项被认为是城市层面治理脏空气措施的弱点？', '["它们对汽车制造商有偏见。","它们对市议会来说不切实际。","它们对政治家来说太温和。","它们把负担放在个体驾车者身上。"]'::jsonb, '原文指出城市措施“不可避免地将清洁空气的成本转嫁给个体司机”，因此D项正确。A项“对制造商有偏见”与原文相反，措施未针对制造商；B项“不切实际”未提及；C项“太温和”与原文“政治上争议”不符。'),
  (33, 0, '作者认为伦敦Ulez的扩展将会____', '["引起强烈抵制。","确保汗的选举成功。","改善城市交通。","阻碍汽车制造业。"]'::jsonb, '原文说扩展Ulez“肯定会引发远更多受影响驾车者的强烈反对”，因此A项正确。B项“确保选举成功”与原文相反，Ulez可能成为选举问题；C项“改善交通”未提及；D项“阻碍汽车制造”未提及。'),
  (34, 3, '作者认为谁本应解决这个问题？', '["当地居民。","市长们。","议员们。","国家政府。"]'::jsonb, '原文说“市长和议员只能做这么多……他们之所以行动是因为国家政府——英国和欧洲其他国家——未能这样做”，因此作者认为国家政府应负责，D项正确。A项“当地居民”是承担成本者；B、C项是已行动但能力有限。'),
  (35, 1, '从最后一段可以得知，汽车公司____', '["将提高低排放汽车产量。","应被强制遵守法规。","将升级其车辆设计。","应受到公众监督。"]'::jsonb, '原文最后一句“我们做了一切，除了坚持要求制造商清洁他们的汽车”，暗示制造商应被要求遵守法规，因此B项正确。A、C项是主动行为，但原文强调“要求”；D项“公众监督”未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2020 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2020 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 3, '今年春天即将大学毕业的Z世代____', '["因他们的能力而受到认可。","赞成办公室工作机会。","对劳动力市场感到乐观。","正引起越来越多的公众关注。"]'::jsonb, '根据原文第一段，Z世代即将毕业，近几周关注度持续上升（the attention has been rising steadily），因此D项正确。A项未提及；B项文中未说他们偏爱办公室工作；C项与原文不符，他们虽面临好经济但仍有焦虑。'),
  (37, 0, 'Z世代敏锐地意识到____', '["严峻的经济形势是什么样的。","他们的父母对他们有什么期望。","他们与过去几代人如何不同。","顾问的建议有多宝贵。"]'::jsonb, '原文第二段指出，Z世代知道经济火车失事是什么样子（know what an economic train wreck looks like），即了解严峻的经济状况，因此A项正确。B项未提及；C项是别人想知道的问题，不是他们意识到的；D项未提及。'),
  (38, 1, '单词“assuage”（第二段第8行）最接近的意思是____', '["定义。","缓解。","维持。","加深。"]'::jsonb, '原文说“蓬勃的经济似乎几乎没有缓解这种潜在的代际焦虑感”，assuage意为“缓解、减轻”，与relieve同义，因此B项正确。其他选项不符合语境。'),
  (39, 2, '从第三段可以得知，Z世代____', '["不太关心他们的工作表现。","把专业培训放在首位。","对他们未来的工作有清晰的认识。","认为实现工作与生活的平衡很难。"]'::jsonb, '第三段提到，88%的毕业生选择专业时考虑就业，最理想的雇主特征是提供稳定就业，职业目标中工作与生活平衡第一，稳定第二，说明他们对未来工作有清晰规划，因此C项正确。A项未提及；B项错误，专业培训是第二重要特征；D项未提及。'),
  (40, 1, 'Michelsen认为，与千禧一代相比，Z世代____', '["不那么现实。","不那么爱冒险。","更勤奋。","更慷慨。"]'::jsonb, '原文最后一段Michelsen说，千禧一代想要更多灵活性，而Z世代寻求更多确定性和稳定性，且相当规避风险（quite risk averse），因此B项正确。A项相反，他们更现实；C、D项未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2020 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2021 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 1, '世界经济论坛的研究表明____', '["关于“核心技能”的争议。","全职就业的增加。","对新工作技能的迫切需求。","工作机会的稳定增长。"]'::jsonb, '根据原文，世界经济论坛的研究发现，到2022年，工作角色中平均42%的“核心技能”将发生变化，这表明技能需求正在快速变化，因此需要新技能。选项C“对新工作技能的迫切需求”符合原文。选项A“关于‘核心技能’的争议”原文未提及争议；选项B“全职就业的增加”和选项D“工作机会的稳定增长”与原文讨论的技能变化无关。'),
  (22, 0, '引用AT&T是为了说明____', '["对政府支持的迫切需求。","解雇与雇佣策略的替代方案。","再培训项目的特征。","员工评估标准的重要性。"]'::jsonb, '原文提到，AT&T被作为决定实施大规模再培训项目而非采用解雇与雇佣策略的公司的黄金标准，因此选项B“解雇与雇佣策略的替代方案”正确。选项A“对政府支持的迫切需求”与AT&T的例子无关，因为AT&T是公司行为；选项C“再培训项目的特征”过于宽泛，AT&T的例子是具体案例；选项D“员工评估标准的重要性”原文未提及。'),
  (23, 3, '加拿大解决技能不匹配的努力____', '["似乎不足。","推高了劳动力成本。","被证明不一致。","遭到强烈反对。"]'::jsonb, '原文提到，加拿大和其他地方的努力“充其量可以说是懒散的”，并且导致雇主在失业率高时也乞求工人的情况，这表明这些努力不够充分。因此选项A“似乎不足”正确。选项B“推高了劳动力成本”原文未提及；选项C“被证明不一致”和选项D“遭到强烈反对”均无原文依据。'),
  (24, 2, '从第三段我们可以了解到有____', '["经济复苏的迹象。","政策调整的呼吁。","招聘实践的变化。","医务人员的短缺。"]'::jsonb, '第三段提到，在医疗领域，疫情意味着医生、护士和其他医务人员仍然明显短缺，因此选项D“医务人员的短缺”正确。选项A“经济复苏的迹象”与失业率上升不符；选项B“政策调整的呼吁”未提及；选项C“招聘实践的变化”虽然提到工人短缺，但重点不是招聘实践的变化，而是短缺本身。'),
  (25, 1, '斯堪的纳维亚航空公司决定____', '["为失业者创造职位空缺。","重新培训他们的乘务员以提供更好的服务。","为他们的下岗工人准备其他工作。","资助员工的大学教育。"]'::jsonb, '原文提到，斯堪的纳维亚航空公司决定启动一个短期再培训项目，将下岗工人重新培训以支持医院工作人员，因此选项C“为他们的下岗工人准备其他工作”正确。选项A“为失业者创造职位空缺”不准确，因为他们是重新培训而非创造职位；选项B“重新培训他们的乘务员以提供更好的服务”错误，因为目的是支持医院工作人员，而非改善航空服务；选项D“资助员工的大学教育”原文未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2021 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2021 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 1, '一些人认为英国的粮食自给自足将____', '["受到其人口增长的阻碍。","有助于国家的福祉。","成为政府的优先事项。","对其农业产业构成挑战。"]'::jsonb, '根据原文，支持脱欧的人认为回归自给自足会促进农业、政治主权甚至国家健康，其中“国家健康”对应“well-being”，因此B正确。A项人口增长是背景，不是论点；C项政府优先事项未提及；D项与原文相反，自给自足被视为机遇而非挑战。'),
  (27, 2, '利兹大学的报告显示，在英国____', '["农田未被有效利用。","工厂式生产需要改革。","大部分土地用于肉类和奶制品生产。","更多绿地将被转为农田。"]'::jsonb, '原文明确提到“85 percent of the country’s total land area is associated with meat and dairy production”，即大部分土地与肉类和奶制品生产相关，因此C正确。A项未提及效率问题；B项是作者建议的“可能”措施，不是报告内容；D项与原文“更少的绿地和更多工厂式生产”相反。'),
  (28, 2, '英国的作物种植受到限制，原因是____', '["其农业技术。","其饮食传统。","其自然条件。","其商业利益。"]'::jsonb, '原文指出“most of its terrain doesn’t have the right soil or climate to grow crops”，即土壤和气候不适合，属于自然条件，因此C正确。A项技术未提及；B项饮食传统不是限制原因；D项商业利益未提及。'),
  (29, 0, '从最后一段可以得知，英国人____', '["很大程度上依赖进口新鲜农产品。","水果消费量稳步上升。","正在寻找有效减少卡路里摄入的方法。","正尝试种植新谷物品种。"]'::jsonb, '原文提到“Just 23 percent of the fruit and vegetables consumed in the UK are currently home-grown”，意味着77%依赖进口，因此A正确。B项“稳步上升”未提及；C项“减少卡路里”是作者讨论的假设，不是英国人的行为；D项“新谷物品种”未提及。'),
  (30, 1, '作者对英国粮食自给自足的态度是____', '["防御性的。","怀疑的。","宽容的。","乐观的。"]'::jsonb, '作者通过报告数据和分析指出自给自足不可行，如“Sounds great — but how feasible is this vision?”以及“even with the most extreme measures we could meet only 30 percent of our fresh produce needs”，表明怀疑态度，因此B正确。A项防御性、C项宽容、D项乐观均不符合。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2021 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2021 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 0, '关于Wunderlist和Sunrise在被收购之后，下列哪项是正确的？', '["A. 它们的工程师被留用了。","B. 它们的市场价值下降了。","C. 它们的技术功能得到了改进。","D. 它们的产品被重新定价了。"]'::jsonb, '原文提到“Their teams of engineers stayed on”，即它们的工程师团队留了下来，因此A正确。文中未提及市场价值下降、技术功能改进或产品重新定价，因此B、C、D均无依据。'),
  (32, 1, '微软的批评者认为，大型科技公司倾向于____', '["A. 夸大其产品质量。","B. 消除其潜在竞争对手。","C. 不公平地对待新的科技人才。","D. 忽视公众意见。"]'::jsonb, '批评者认为大科技公司“chew up any innovative companies that lie in their path”，即吞噬任何阻碍它们的创新公司，并“putting an end to businesses that might one day turn into competitors”，即终结可能成为竞争对手的企业，因此B正确。A、C、D在文中没有提及。'),
  (33, 2, '保罗·阿诺德担心小规模收购可能会____', '["A. 削弱大型科技公司。","B. 加剧市场竞争。","C. 损害国民经济。","D. 打击初创企业投资者。"]'::jsonb, '阿诺德说“But are they good for the American economy? I don’t know.”，表明他担心这些收购对美国经济的影响，因此C正确。他并未担心削弱大公司或加剧竞争，也未表示会打击投资者，相反他承认对自己有利，因此A、B、D不正确。'),
  (34, 2, '美国联邦贸易委员会打算____', '["A. 限制大型科技公司的扩张。","B. 鼓励研究合作。","C. 审查小型收购。","D. 监督初创企业的运营。"]'::jsonb, '原文说“it asked the five most valuable US tech companies for information about their many small acquisitions”，即要求提供关于小型收购的信息，因此C正确。文中未提及限制扩张、鼓励合作或监督初创企业运营，因此A、B、D不正确。'),
  (35, 0, '对于五大科技公司而言，它们的小型收购____', '["A. 几乎没有带来财务压力。","B. 几乎没有带来管理挑战。","C. 为未来交易树立了榜样。","D. 产生了可观的利润。"]'::jsonb, '原文提到“spent an average of only $3.4 billion a year... a drop in the ocean compared with their massive financial reserves”，即这些收购花费相对其巨额储备只是沧海一粟，因此A正确。文中未提及管理挑战、榜样作用或利润，因此B、C、D不正确。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2021 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2021 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 1, 'Nalini Ambady的研究涉及____', '["人们记忆的力量。","第一印象的可靠性。","师生互动。","人们影响他人的能力。"]'::jsonb, '正确项B：文章开头提到“我们相当擅长根据第一印象判断他人”，随后介绍Ambady的研究，参与者观看教授的视频片段后评分，结果与学期末学生评分高度相关，这证明了第一印象的可靠性。A项“记忆的力量”未提及；C项“师生互动”只是研究背景，不是研究主题；D项“影响他人的能力”与内容无关。'),
  (37, 0, '在Ambady的研究中，当参与者____时，评分的准确性大幅下降。', '["关注具体细节。","在有限时间内给出评分。","观看更短的视频片段。","相互讨论。"]'::jsonb, '正确项A：原文指出，当参与者被要求花一分钟写下判断理由时，准确性大幅下降，因为深思使他们关注生动但误导性的线索，如特定手势或话语，即具体细节。B项“有限时间”未提及；C项“更短的片段”与原文不符，原文片段长度固定；D项“讨论”未提及。'),
  (38, 0, 'Judith Hall提到驾驶是为了表明____', '["反思可能分散注意力。","记忆可能具有选择性。","社交技能必须培养。","欺骗难以察觉。"]'::jsonb, '正确项A：Hall用驾驶手动挡汽车作比喻，说明如果过度思考（反思）反而会忘记操作，而自动操作则没问题，以此类比社交中过度思考会干扰表现，即反思可能分散注意力。B项“记忆选择性”未提及；C项“社交技能培养”与比喻无关；D项“欺骗难以察觉”是前文内容，但不是比喻的目的。'),
  (39, 3, '当你做复杂决策时，建议你____', '["收集足够的数据。","列出你的偏好。","寻求专家建议。","跟随你的感觉。"]'::jsonb, '正确项D：原文提到，当决策复杂且信息量大时，被要求关注感受而非细节的人做出的购车决策在客观上更好且更令人满意，因此建议跟随感觉。A项“收集数据”与原文相反，原文强调不要关注细节；B项“列出偏好”未提及；C项“专家建议”未提及。'),
  (40, 1, '从最后一段我们能了解到什么？', '["生成新产品需要时间。","直觉可能影响反思性任务。","词汇理解需要创造力。","客观思考可能促进发明创造。"]'::jsonb, '正确项B：最后一段的研究中，参与者完成八项任务，其中四项涉及反思性思维，四项涉及直觉和创造力。结果发现，使用直觉（gut feelings）在反思性任务上表现更差，在创造性任务上表现更好，说明直觉可能影响反思性任务（此处“影响”指负面影响）。A项“生成新产品需要时间”未提及；C项“词汇理解需要创造力”与原文不符，词汇理解属于反思性任务；D项“客观思考可能促进发明创造”与原文相反，原文表明直觉有助于创造性任务。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2021 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2022 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 3, '气候友好型鸡蛋是在____生产的。', '["以相当低的成本。","根据普通购物者的需求。","作为有机鸡蛋的替代品。","在特别设计的农场。"]'::jsonb, '根据原文，这些鸡蛋来自使用再生农业的农场，这些农场采用特殊技术来培养富含温室气体的土壤，因此这些农场是特别设计的。选项D正确。A项错误，因为鸡蛋售价高达8美元一打，成本不低。B项错误，文中未提及普通购物者的需求。C项错误，文中说这些鸡蛋仍被标记为有机，并非替代有机鸡蛋。'),
  (22, 2, 'Larry Brown对他____的进展感到兴奋。', '["减少蠕虫的损害。","加速废物的处理。","创建一个可持续的系统。","吸引顾客购买他的产品。"]'::jsonb, '原文中Larry Brown提到，他们添加覆盖作物吸引蠕虫和蟋蟀供鸡食用，鸡的粪便肥沃土地，这些改进让母鸡能觅食更高质量的天然饲料，对土地、母鸡和鸡蛋都有好处。这体现了一个可持续的系统。选项C正确。A项错误，文中未提及减少蠕虫损害，而是利用蠕虫。B项错误，文中未提及加速废物处理。D项错误，文中未提及吸引顾客。'),
  (23, 2, '第4段中关于有机鸡蛋的例子是为了表明____。', '["对天然饲料的怀疑。","鸡蛋行业的挫折。","再生产品的潜力。","超市的促销成功。"]'::jsonb, '第4段提到有机鸡蛋从被忽视到在沃尔玛销售，说明类似产品可能成功，从而暗示再生农业产品也有潜力。选项C正确。A项错误，文中未提及对天然饲料的怀疑。B项错误，文中未提及挫折。D项错误，重点不是超市的促销，而是产品被接受的过程。'),
  (24, 1, '从第6段可以了解到，年轻人____。', '["不愿意改变他们的饮食。","可能购买气候友好型鸡蛋。","对新食物感到好奇。","对农业进步感到惊讶。"]'::jsonb, '第6段提到调查显示年轻一代更关心气候变化，植物基肉类的成功部分归因于购物者希望表明他们保护环境的愿望。因此，年轻人可能购买气候友好型鸡蛋。选项B正确。A项错误，文中未提及不愿改变饮食。C项错误，文中未提及好奇。D项错误，文中未提及惊讶。'),
  (25, 0, 'John Brunnquell在再生产品的____上会不同意Julie Stanton的观点。', '["营养价值。","标准定义。","市场前景。","道德含义。"]'::jsonb, 'Julie Stanton认为再生农业对食品几乎没有改善，而John Brunnquell提到年轻人关心地球，正在改变食物链，暗示他认为再生产品有积极影响。但问题问的是他们分歧的方面。Julie Stanton提到概念难以定义，但John Brunnquell没有直接反驳定义。然而，Julie Stanton说“Such farming also brings minimal, if any, improvement to the food products”，而John Brunnquell强调年轻人关心地球，可能认为产品有环境价值，但营养价值方面，Julie Stanton暗示没有改善，而John Brunnquell可能认为有改善？实际上，John Brunnquell没有直接说营养价值，但选项A是唯一可能的。根据原文，Julie Stanton说“minimal improvement to the food products”，而John Brunnquell说“altering the food chain”，可能暗示产品更好。因此，他们可能在营养价值上有分歧。选项A正确。B项错误，Julie Stanton提到定义困难，但John Brunnquell没有反对。C项错误，两人都未明确讨论市场前景。D项错误，道德含义未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2022 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2022 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 3, '哈里斯民意调查进行的调查表明____', '["超过一半的退休人员身体健康，适合工作。","老年劳动力与年轻劳动力一样活跃。","三分之一的美国人喜欢提前退休。","更多的美国人愿意在退休后继续工作。"]'::jsonb, '根据原文第一段，哈里斯民意调查显示，40岁及以上的美国人中有三分之一已经或计划在退休后工作，且超过一半的“退而不休”者表示即使有足够钱也会继续工作。因此选项D“更多的美国人愿意在退休后工作”正确。选项A、B、C在原文中均未提及或与原文不符。'),
  (27, 0, '从第三段可以推断出，美国人倾向于认为____', '["退休可能会给他们带来问题。","退休后无聊感可以得到缓解。","退休人员的心理健康被忽视。","“退而不休”对经济有贡献。"]'::jsonb, '第三段提到，除了财务需求，其他原因包括个人成就感，如保持心理健康、防止无聊或避免抑郁。这表明美国人认为退休可能导致无聊或抑郁等问题，因此选项A正确。选项B与原文相反，因为防止无聊是继续工作的原因；选项C和D在原文中未提及。'),
  (28, 2, '退休模式改变的部分原因是____', '["劳动力短缺。","人口增长。","预期寿命延长。","生活成本上升。"]'::jsonb, '原文第四段明确指出：“One reason for the change in retirement patterns: Americans are living longer.” 即退休模式改变的一个原因是美国人活得更长，即预期寿命延长。因此选项C正确。其他选项在原文中未提及。'),
  (29, 3, '许多“退而不休”者通过____来增加储蓄。', '["投资更多股票。","从事零工。","获得高薪工作。","减少开支。"]'::jsonb, '原文第五段提到：“Among the most popular ways they are doing this, the company said, is by reducing their overall expenses...” 即最流行的方法之一是减少总体开支。因此选项D“减少开支”正确。其他选项在原文中未提及。'),
  (30, 0, '关于退休，布伦特·韦斯认为许多人____', '["没有准备好。","不害怕。","失望。","热情。"]'::jsonb, '原文最后一段中，布伦特·韦斯说：“Unfortunately, many people who are opting to work in retirement are preparing to do so because they are worried about making ends meet in their later years.” 并建议退休前的人与财务顾问交谈以设定长期目标。这表明他认为许多人没有为退休做好充分准备，因此选项A正确。其他选项与原文不符。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2022 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2022 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 2, '从前两段可以得知，暗黑模式____', '["改善用户体验。","为获利而泄露用户信息。","削弱用户的决策能力。","提醒用户注意隐藏成本。"]'::jsonb, '正确选项为C。第一段提到暗黑模式“impair consumer choice”，第二段进一步指出这些做法“manipulate user interfaces to influence the decision-making ability of users”，即影响用户的决策能力，与C项“削弱用户的决策能力”相符。A项与原文相反，暗黑模式并非改善体验；B项文中未提及泄露信息获利；D项是暗黑模式的一种类型，但并非前两段主要说明的内容。'),
  (32, 3, '提到2019年关于暗黑模式的研究是为了说明____', '["它们的主要缺陷。","它们复杂的设计。","它们严重的危害。","它们的大量存在。"]'::jsonb, '正确选项为D。原文提到“In a 2019 study ... researchers found that about one in 10 employs these design practices.”，即研究发现约十分之一的网站使用暗黑模式，这说明了暗黑模式的普遍性，与D项“它们的大量存在”相符。A、B、C项均不是该研究的主要目的，研究并未强调缺陷、设计复杂性或危害。'),
  (33, 1, '为了应对数字欺骗，企业应该____', '["听取客户反馈。","与相关团队沟通。","求助于独立机构。","依靠专业培训。"]'::jsonb, '正确选项为B。原文第三段指出“Businesses should engage in conversations with IT, compliance, risk, and legal teams ...”，即企业应与IT、合规、风险、法律等团队进行沟通，与B项“与相关团队沟通”相符。A项“客户反馈”未提及；C项“独立机构”未提及；D项“专业培训”未提及。'),
  (34, 1, 'CCPA下的附加法规旨在____', '["指导用户完成退出流程。","保护消费者不被欺骗。","授予公司数据隐私权。","限制访问有问题的内容。"]'::jsonb, '正确选项为B。原文第四段提到这些法规“ensure that consumers will not be confused or misled when seeking to exercise their data privacy rights”，即确保消费者在行使数据隐私权时不会感到困惑或被误导，并禁止暗黑模式，因此目的是保护消费者不被欺骗，与B项相符。A项只是手段之一，不是目的；C项与原文相反，法规是保护消费者权利而非授予公司权利；D项“限制访问内容”未提及。'),
  (35, 1, '根据最后一段，应对暗黑模式的一个关键是____', '["新的法律要求。","企业的自律。","严格的监管标准。","消费者的安全意识。"]'::jsonb, '正确选项为B。最后一段提到“Dark patterns also can be addressed on a self-regulatory basis, but only if organizations hold themselves accountable ...”，即暗黑模式可以通过自律解决，但前提是组织自我约束，因此关键是企业自律，与B项相符。A项“新的法律要求”是外部因素，不是关键；C项“严格的监管标准”也是外部因素；D项“消费者安全意识”未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2022 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2022 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 0, '科学家普遍认为伦理课的效果是____', '["难以确定。","被狭隘地解释。","难以忽视。","被糟糕地总结。"]'::jsonb, '根据原文第一句“scientists are unsure if their lessons can actually change behavior; evidence either way is weak”，科学家不确定伦理课能否改变行为，证据薄弱，因此效果难以确定。选项A正确。B、C、D在原文中没有依据。'),
  (37, 1, '以下哪项是研究人员研究吃肉行为的原因？', '["它在学生中很普遍。","它是一种容易测量的行为。","它对学生的健康很重要。","它是伦理课上的热门话题。"]'::jsonb, '原文提到研究吃肉行为的原因包括：学生态度多变且不稳定、行为容易测量、伦理文献认为少吃肉有益。其中“behavior is easily measurable”对应选项B。A、C、D在原文中未提及。'),
  (38, 3, 'Eric Schwitzgebel之前的发现表明，伦理学教授____', '["很少批评他们的学生。","比其他教授更不善社交。","对政治问题不敏感。","不一定在道德上更好。"]'::jsonb, '原文提到Schwitzgebel之前发现伦理学教授在投票率、献血、归还图书馆书籍等一系列行为上与其他教授没有差异，说明伦理学教授不一定在道德行为上更优。选项D正确。A、B、C在原文中无依据。'),
  (39, 2, 'Nina Strohminger认为干预的效果是____', '["永久的。","可预测的。","不确定的。","不可重复的。"]'::jsonb, '原文中Nina Strohminger说“she wants the effect to be real but cannot rule out some unknown confounding variable”，并指出效果可能被其他推动逆转，表明她对效果的真实性和持久性不确定。选项C正确。A、B、D与原文不符。'),
  (40, 2, 'Eric Schwitzgebel怀疑学生的行为改变____', '["能带来心理上的好处。","可以被统计分析。","是多种因素的结果。","是自我发展的标志。"]'::jsonb, '原文中Schwitzgebel认为影响最大的是社会影响，其次是视频的情感影响，最后是理性论证，说明他认为行为改变是多种因素共同作用的结果。选项C正确。A、B、D在原文中未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2022 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2023 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 0, '皇家园艺学会认为塑料草____', '["对环境有害。","是园艺界的热门话题。","在年度展览中被过度赞扬。","正在破坏伦敦西部的景观。"]'::jsonb, '根据原文，RHS因塑料草对环境和生物多样性造成损害而禁止其参展，并推荐使用真草，因为真草有益于环境。因此A正确。B项是事实但非RHS的观点；C项无中生有；D项错误，原文未提及破坏景观。'),
  (22, 1, '第三段提到的请愿书揭示了活动人士的____', '["对皇家园艺学会的失望。","对使用假草的抵制。","对拟议税收的愤怒。","对真草供应的担忧。"]'::jsonb, '第三段中活动人士发起请愿，呼吁禁止销售塑料草和征收“生态损害”税，这表明他们抵制假草的使用。因此B正确。A项未提及对RHS的失望；C项错误，他们支持税收而非愤怒；D项无关。'),
  (23, 1, '在第四段，假草的支持者指出____', '["降低假草成本的必要性。","种植真草的缺点。","照料人工草坪的方法。","昆虫栖息地保护的挑战。"]'::jsonb, '第四段中，假草支持者指出真草需要修剪（消耗能源）、大量水、除草剂等，这些是真草的缺点。因此B正确。A项未提及成本；C项未提及照料方法；D项与原文不符，原文提到假草花园可提供昆虫栖息地。'),
  (24, 2, '关于人工草，政府会怎么做？', '["敦促立法限制其使用。","采取措施保证其质量。","提醒使用者遵守现有规则。","用可持续的替代品取代它。"]'::jsonb, '最后一段政府表示“没有计划禁止使用人工草”，但强调“使用人工草必须遵守现有的法律和政策保障”，因此C正确。A项与“没有计划立法”矛盾；B项未提及质量；D项政府更倾向于帮助人们做出正确选择，而非强制替代。'),
  (25, 3, '从文中可以得知，假草____', '["正在不断改进。","市场份额已经下降。","变得越来越实惠。","一直是一个有争议的产品。"]'::jsonb, '全文围绕假草展开，既有反对者（RHS、活动人士）也有支持者（行业及消费者），说明假草存在争议。因此D正确。A、B、C在文中均未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2023 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2023 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 3, '美国国家公园面临什么问题？', '["A. 商业利润下降。","B. 商业化不足。","C. 缺乏交通服务。","D. 基础设施维护不善。"]'::jsonb, '正确项为D。原文提到“Roads, trails, restrooms, visitor centers and other infrastructure are crumbling.”，说明基础设施年久失修，即维护不善。A项“商业利润下降”未提及；B项“商业化不足”与原文相反，原文讨论的是过度商业化的问题；C项“缺乏交通服务”未提及，原文只提到道路等基础设施破损。'),
  (27, 0, '增加露营地私有化可能会____', '["A. 破坏游客体验。","B. 有助于保护自然。","C. 带来运营压力。","D. 增加公园访问量。"]'::jsonb, '正确项为A。原文指出“increased privatization would certainly undercut one of the major reasons why 300 million visitors come to the parks each year: to enjoy nature and get a break from the commercial drumbeat that overwhelms daily life.”，即私有化会削弱游客享受自然和远离商业喧嚣的体验，因此会破坏游客体验。B项“有助于保护自然”与原文相反；C项“带来运营压力”未提及；D项“增加公园访问量”与原文逻辑不符，私有化可能减少访问量。'),
  (28, 2, '根据第五段，调查中的大多数受访者会____', '["A. 定期去国家公园。","B. 主张为国家公园增加预算。","C. 同意为国家公园额外付费。","D. 支持国家公园最近的改革。"]'::jsonb, '正确项为C。原文提到“Some 81% of respondents said they would be willing to pay additional taxes for the next 10 years to avoid any cuts to the national parks.”，即81%的受访者愿意额外纳税，因此大多数受访者同意额外付费。A项“定期去”未提及；B项“主张增加预算”是政府行为，不是受访者直接表态；D项“支持改革”未提及。'),
  (29, 1, '国家公园很有价值，因为它们____', '["A. 在旅游业中领先。","B. 具有历史意义。","C. 赞助气候研究。","D. 为当地人提供收入。"]'::jsonb, '正确项为B。原文提到“The parks also help keep America’s past alive, working with thousands of local jurisdictions around the country to protect historical sites — including Ellis Island and Gettysburg — and to bring the stories of these places to life.”，说明公园保护历史遗址，具有历史意义。A项“在旅游业中领先”未提及；C项“赞助气候研究”错误，原文说公园通过碳封存对气候产生积极影响，并非赞助研究；D项“为当地人提供收入”未提及。'),
  (30, 3, '从文中可以得出结论，国家公园系统____', '["A. 能够应对人员短缺。","B. 能够满足游客需求。","C. 需要新的定价政策。","D. 需要增加资金。"]'::jsonb, '正确项为D。原文指出“The real problem is that the parks have been chronically starved of funding.”，并且提到国会拨款自2001年以来基本持平，而游客数量增加，导致维护积压，因此公园系统需要增加资金。A项“人员短缺”未提及；B项“满足游客需求”与原文矛盾，因为基础设施破损；C项“新的定价政策”未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2023 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2023 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 2, '斯帕罗的研究表明，有了互联网，人脑将会____', '["A. 详细分析信息。","B. 高效收集信息。","C. 转换其记忆的焦点。","D. 延长其记忆持续时间。"]'::jsonb, '正确项C的依据是原文中斯帕罗的研究发现：参与者不记得信息本身，但记得如何找到存储信息的文件夹，这表明记忆的焦点从记住信息本身转向记住如何获取信息。A项“详细分析信息”在原文中未提及；B项“高效收集信息”与记忆焦点无关；D项“延长记忆持续时间”与原文不符，原文强调的是记忆内容的变化而非时间延长。'),
  (32, 3, '“认知卸载”的过程____', '["A. 帮助我们识别虚假信息。","B. 防止我们的记忆衰退。","C. 使我们能够对琐碎事实进行分类。","D. 减轻我们的记忆负担。"]'::jsonb, '正确项D的依据是原文将互联网比作“外部硬盘”，并提到“认知卸载”是指将记忆任务外包给外部设备，从而减轻大脑的记忆负担。A项“识别虚假信息”在原文中未提及；B项“防止记忆衰退”与原文“记忆并未恶化”不符，但“认知卸载”并非为了防止衰退；C项“对琐碎事实进行分类”是研究中的具体任务，但“认知卸载”的核心是减轻负担，而非分类。'),
  (33, 0, '关于互联网，斯帕罗会支持以下哪项？', '["A. 它可能改变我们的学习方法。","B. 它可能对我们的社会产生负面影响。","C. 它可能增强我们对技术的适应能力。","D. 它可能干扰我们的概念思维。"]'::jsonb, '正确项A的依据是原文中斯帕罗提出，互联网可能将我们的学习方法从关注事实和记忆转向更概念性的思维。B项是“一些人担心”的观点，但斯帕罗看到的是“好处”；C项“增强适应能力”是斯帕罗对记忆的描述，但并非关于学习方法的支持；D项与斯帕罗的观点相反，她认为概念思维是互联网无法提供的，因此不会受干扰。'),
  (34, 0, '第三段表明，互联网如何影响我们的大脑____', '["A. 需要进一步的学术研究。","B. 在老年人中研究最多。","C. 反映在我们的阅读速度上。","D. 取决于我们的上网习惯。"]'::jsonb, '正确项A的依据是第三段开头提到“其他专家说，要理解互联网如何影响我们的大脑还为时过早”，并指出没有实验证据表明它干扰专注力，暗示需要更多研究。B项“在老年人中研究最多”不准确，原文只提到一项涉及24名老年人的研究；C项“反映在阅读速度上”在原文中未提及；D项“取决于上网习惯”在原文中未提及。'),
  (35, 1, '斯帕罗和斯托姆都不会同意____', '["A. 我们对互联网的依赖将是代价高昂的。","B. 互联网正在削弱我们的记忆力。","C. 记忆锻炼对我们的大脑是必需的。","D. 我们的专注力随年龄下降。"]'::jsonb, '正确项B的依据是斯帕罗明确表示“人类记忆并未恶化”，而斯托姆说“记忆正在改变，但不知道是否变得更好”，两人都未认为互联网削弱记忆力。A项斯托姆提到“可能有代价”，但斯帕罗未明确同意；C项斯帕罗说“从未看到记忆的智力价值”，但未讨论记忆锻炼的必要性；D项在原文中未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2023 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2023 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 0, '根据第一段，进入青春期的孩子倾向于____', '["发展出相反的人格特质。","以不合理的方式看待世界。","对过去有美好的回忆。","对父母表现出爱意。"]'::jsonb, '正确选项为A。第一段提到青少年是矛盾的，他们从依赖变得独立，同时从顺从变得叛逆，这些是相反的特质。B项“以不合理的方式看待世界”未提及；C项“对过去有美好的回忆”未提及；D项“对父母表现出爱意”与原文不符，原文说他们变得叛逆。'),
  (37, 2, '从第二段可以得知，Crone的研究____', '["探索青少年的社会责任。","检查青少年的情绪问题。","为青春期提供了新的见解。","强调青少年的负面行为。"]'::jsonb, '正确选项为C。第二段提到“The study is part of a new wave of thinking about adolescence”，并强调青春期是机遇和风险并存，这提供了新见解。A项“社会责任”未提及；B项“情绪问题”未提及；D项“强调负面行为”与原文不符，原文强调正面和负面并存。'),
  (38, 3, '关于亲社会行为，Crone的研究发现了什么？', '["它源于合作的愿望。","它通过教育培养。","它受家庭影响。","它在青春期达到顶峰。"]'::jsonb, '正确选项为D。第三段提到“the same pattern holds for prosocial behavior”，即亲社会行为在青少年时期增加，然后随年龄增长而减少，因此它在青春期达到顶峰。A项“合作的愿望”未提及；B项“教育”未提及；C项“家庭影响”未提及。'),
  (39, 1, '从最后两段可以得知，青少年____', '["过分强调他们对别人的影响。","非常在意社会认可。","对自己的未来感到焦虑。","努力过快乐的生活。"]'::jsonb, '正确选项为B。最后一段提到青少年对社会奖励特别敏感，如赢得比赛、给新朋友留下印象、让男孩注意到你，这些都是社会认可的体现。A项“过分强调影响”未提及；C项“焦虑”未提及；D项“快乐生活”未提及。'),
  (40, 0, '这篇文章主要关于什么？', '["为什么青少年自相矛盾。","为什么青少年对风险敏感。","青少年如何发展亲社会性。","青少年如何变得独立。"]'::jsonb, '正确选项为A。文章开头提出青少年是矛盾的，然后通过研究说明亲社会行为和叛逆行为同时发展，并探讨了可能的原因（奖励敏感性），整体围绕青少年为何自相矛盾。B项只涉及风险敏感，不全面；C项只涉及亲社会性，不全面；D项只涉及独立，不全面。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2023 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2024 年 阅读 Part A Text 1
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (21, 2, 'Coyle在她的新书中认为，经济增长应该______', '["催生创新。","使职业选择多样化。","使人们平等受益。","被强力推动。"]'::jsonb, '根据原文，Coyle写道：“无论我们所说的经济增长、事情变好意味着什么，收益都必须比最近过去更均匀地分享。”这表明她认为经济增长的收益应该更公平地分配，因此选项C“使人们平等受益”正确。选项A“催生创新”和B“使职业选择多样化”在原文中未提及；选项D“被强力推动”与原文强调的公平分享不符。'),
  (22, 2, '根据第二段，数字技术应该被用来______', '["带来即时繁荣。","减少人们的工作量。","提高整体工作效率。","加强跨部门合作。"]'::jsonb, '原文第二段提到：“提高生活水平和为更多人增加繁荣将需要更多地使用数字技术来提高各行业的生产率，包括医疗保健和建筑业。”生产率即工作效率，因此选项C“提高整体工作效率”正确。选项A“带来即时繁荣”未提及；选项B“减少人们的工作量”和D“加强跨部门合作”在原文中无依据。'),
  (23, 3, '关于变革性技术，Coyle担心什么？', '["它们可能影响工作与生活的平衡。","它们可能不切实际，难以部署。","它们可能产生巨额开支。","它们可能不受公众欢迎。"]'::jsonb, '原文中Coyle说：“我们谈论的是颠覆……这些是变革性技术，改变我们每天花费时间的方式，改变成功的商业模式。”她补充说，要进行这样的“巨大变革”，你需要社会的认可。而“怨恨正在许多人心头酝酿，因为收益被认为流向了少数繁荣城市的精英。”这表明她担心公众可能不欢迎这些技术，因此选项D“它们可能不受公众欢迎”正确。选项A、B、C在原文中均未提及。'),
  (24, 0, '提到几个美国城市是为了显示______', '["美国AI技术分布不均。","美国科技工作令人失望的前景。","美国区域经济的快速发展。","美国AI资产日益增长的重要性。"]'::jsonb, '原文提到布鲁金斯学会的数据，显示少数城市集中了大部分科技工作和AI资产，例如“到2019年，包括旧金山、圣何塞、波士顿和西雅图在内的八个美国城市约占所有科技工作的38%”，以及“仅15个城市就占美国AI资产和能力的三分之二”。这些例子旨在说明AI技术在地理上分布不均，因此选项A“美国AI技术分布不均”正确。选项B“令人失望的前景”未提及；选项C“区域经济的快速发展”与原文相反，原文说“地理财富差距将继续飙升”；选项D“日益增长的重要性”不是重点。'),
  (25, 3, '关于Coyle的担忧，作者建议______', '["筹集资金启动新的AI项目。","鼓励AI研究合作。","防范AI的副作用。","重新定义AI技术的角色。"]'::jsonb, '原文最后一段提出：“一个更直接的反应是拓宽我们的数字想象力，以构想AI技术，这些技术不仅取代工作，而且扩大全国不同地区最关心的行业的机会，如医疗保健、教育、制造业。”这暗示需要重新定义AI技术的角色，使其不仅替代工作，还能创造机会，因此选项D“重新定义AI技术的角色”正确。选项A“筹集资金”是部分解决方案，但不是作者建议的主要方向；选项B“鼓励合作”未提及；选项C“防范副作用”与原文不符。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2024 and s.type = 'reading_a' and g.passage_number = 1
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2024 年 阅读 Part A Text 2
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (26, 0, '从第一段可以得知，英国需要______', '["增加其国内木材供应。","减少其对木材的需求。","降低其木材生产成本。","解除其对木材进口的控制。"]'::jsonb, '第一段指出，英国面临未来的建筑危机，因为未能种植树木来生产木材，目前只有20%的木材需求是国内满足的，而它是世界第二大木材净进口国。Confor呼吁采取紧急行动减少对木材进口的依赖，并为后代提供稳定的木材供应。因此，英国需要增加国内木材供应。选项A正确。选项B“减少需求”并非原文所述，原文强调的是增加国内供应；选项C“降低生产成本”未提及；选项D“解除进口控制”与原文呼吁减少依赖进口相反。'),
  (27, 0, '根据Confor的说法，英国政府的新激励措施______', '["几乎无法解决建筑危机。","被认为来得不是时候。","似乎对土地所有者有误导性。","实施起来代价太高。"]'::jsonb, '第二段提到，英国政府为土地所有者种植更多树木提供了新的激励措施，但Confor表示这些措施“还不够”，并且未能促进种植树木以增加木材供应的好处。因此，这些激励措施不足以解决未来的建筑危机。选项A正确。选项B“时机不对”未提及；选项C“误导”不准确，原文说它们不够且未能促进好处；选项D“代价太高”未提及。'),
  (28, 1, '英国暴露于波动的木材价格之下是______的结果。', '["政府在木材进口上的不作为。","对种植木材的投资不足。","国内木材商之间的竞争。","木材生产者追求利润最大化的动机。"]'::jsonb, '第三段中，Confor首席执行官Stuart Goodall说：“几十年来，我们没有承担起投资国内木材供应的责任，使我们暴露于价格波动之中……”因此，英国暴露于波动的木材价格是投资不足的结果。选项B正确。选项A“进口不作为”不准确，原文强调的是投资不足；选项C“国内竞争”未提及；选项D“利润最大化”未提及。'),
  (29, 3, '以下哪项导致了英国木材供应的短缺？', '["建筑中木材消耗过多。","不利于木材生长的条件。","木材行业的技术过时。","农民不愿种树。"]'::jsonb, '第四段提到，英国当前状况的原因复杂，包括对生产性林业的过时观念、灰松鼠对树木的破坏，以及农民和其他土地所有者对长期种植项目投资的重大犹豫。因此，农民不愿种树是原因之一。选项D正确。选项A“过度消耗”未提及；选项B“不利条件”与原文相反，原文说英国有理想的木材生长条件；选项C“技术过时”未提及。'),
  (30, 2, '古多尔认为英国政府应该做什么？', '["补贴低碳住宅的建设。","更加重视促进农村经济。","为生产性植树提供更多支持。","优先追求其净零战略。"]'::jsonb, '最后一段中，Goodall说：“虽然英国政府已经表达了更多植树的雄心，但实际采取的行动很少。Confor现在呼吁为这些愿望提供更大的推动力，以确保我们有足够的木材来满足日益增长的需求。”此外，前文提到政府支持的重点仍然是粮食生产以及仅为生物多样性的再野化和种植原生林地，而Goodall认为土地也需要提供木材。因此，他认为政府应该为生产性植树提供更多支持。选项C正确。选项A“补贴低碳住宅”未提及；选项B“农村经济”是植树的好处之一，但并非政府应做的直接行动；选项D“净零战略”是植树贡献的目标，但并非政府应优先做的。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2024 and s.type = 'reading_a' and g.passage_number = 2
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2024 年 阅读 Part A Text 3
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (31, 2, '根据第一段，让不安全的老年驾驶员远离道路______', '["是一项新的安全措施。","已经成为一个有争议的问题。","可能是一项艰巨的任务。","对他们的健康有益。"]'::jsonb, '正确项C依据第一段首句“One of the biggest challenges... is convincing them that it’s time to turn over the keys”，表明让老年驾驶员停止开车是一个巨大挑战，即困难任务。A项“新的安全措施”未提及；B项“争议问题”虽涉及不同州法律，但首段重点在挑战；D项“有益健康”文中未提。'),
  (32, 3, '美国医学协会的建议______', '["得到了驾驶员的支持。","普遍被认为不切实际。","被广泛认为没有必要而遭到忽视。","遇到了不同的回应。"]'::jsonb, '正确项D依据文中“Some states require physicians to report, others allow but do not mandate reports, while a few consider a report a breach of confidentiality”，说明各州反应不同。A项“驾驶员支持”未提及；B项“不切实际”无依据；C项“广泛忽视”与文中各州不同规定不符。'),
  (33, 1, '根据Dugan的说法，保障老年驾驶员安全的努力______', '["已经带来了巨大变化。","需要很好的协调。","已经获得公众认可。","需要相关的法律支持。"]'::jsonb, '正确项B依据Dugan所说“the difficulties are addressed piecemeal by different professions with different focuses”，表明问题被不同职业零散处理，缺乏协调。A项“巨大变化”与“piecemeal”矛盾；C项“公众认可”未提及；D项“法律支持”虽涉及法律，但Dugan强调协调而非法律。'),
  (34, 1, '一些老年驾驶员开车有困难，因为他们往往______', '["坚持不良驾驶习惯。","记忆力减弱。","患有慢性疼痛。","忽视汽车保养。"]'::jsonb, '正确项B依据文中“can’t remember where they are going”，表明记忆力问题。A项“不良习惯”未提及；C项“慢性疼痛”未提及；D项“忽视保养”未提及。'),
  (35, 1, 'Dugan认为解决车祸问题的办法可能在于______', '["升级自动驾驶汽车。","开发适合老年人的汽车。","改造交通设施。","调整驾驶员年龄限制。"]'::jsonb, '正确项B依据Dugan最后一句“we need cars that a 90-year-old can drive comfortably”，表明需要适合老年人的汽车。A项“升级自动驾驶”被Dugan否定，因人类驾驶员问题；C项“交通设施”未提及；D项“年龄限制”未提及。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2024 and s.type = 'reading_a' and g.passage_number = 3
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

-- 2024 年 阅读 Part A Text 4
insert into private.question_keys (question_id, correct_option, prompt_zh, option_translations, explanation)
select q.id, v.correct_option, v.prompt_zh, v.option_translations, v.explanation
from questions q
join passages g on g.id = q.passage_id
join exam_sections s on s.id = g.section_id
join exam_papers p on p.id = s.paper_id
join (values
  (36, 0, '第一段引用研究结果是为了表明______', '["健康应用程序的普及。","公众对健康的关注。","智能手机的流行。","技术的进步。"]'::jsonb, '正确项A：第一段引用研究数据（35万健康应用，2020年新增9万）是为了说明健康应用数量之多，即其普及程度。B、C、D虽与背景相关，但并非引用研究的目的，研究数据直接指向健康应用的市场规模。'),
  (37, 0, '关于现有的健康隐私法，作者暗示了什么？', '["其覆盖范围需要扩大。","其执行需要加强。","它已经阻止了医疗不当行为。","它让保险公司失望了。"]'::jsonb, '正确项A：作者指出现有法律（如HIPAA）主要针对医院、诊所等，而健康应用收集的数据通常不受同等法律保护，暗示法律覆盖范围不足，需要扩展。B未提及执行问题；C与原文不符，原文未说法律已阻止不当行为；D无依据。'),
  (38, 3, '在分享用户健康信息之前，Flo Health被要求______', '["寻求FTC的批准。","找到合格的第三方。","删除无关的个人数据。","获得用户的明确同意。"]'::jsonb, '正确项D：原文明确说“Consent Order requiring the company to get app users’ express affirmative consent before sharing their health information”，即要求获得用户的明确肯定同意。A、B、C均未提及。'),
  (39, 1, 'FTC目前面临的挑战是什么？', '["健康信息的复杂性。","新健康应用的快速增长。","健康应用的微妙欺骗性。","评估消费者伤害的难度。"]'::jsonb, '正确项B：原文说“the rate at which these health apps are hitting the market demonstrates just how immense of a challenge this is”，即健康应用进入市场的速度表明挑战巨大。A、C、D均未提及。'),
  (40, 3, '从最后一段可以得知，健康数据保护______', '["已被健康应用开发者接受。","一直是联邦政策制定的重点。","在加州遇到了反对。","在一些州获得了立法支持。"]'::jsonb, '正确项D：最后一段提到联邦立法短期内不太可能，但一些州已开始立法，如加州、弗吉尼亚、科罗拉多和犹他州，说明健康数据保护在一些州获得了立法支持。A未提及开发者态度；B与原文相反，联邦立法前景不明；C与原文不符，加州是先行者。')
) as v(question_number, correct_option, prompt_zh, option_translations, explanation) on v.question_number = q.question_number
where p.year = 2024 and s.type = 'reading_a' and g.passage_number = 4
on conflict (question_id) do update set
  correct_option = excluded.correct_option,
  prompt_zh = excluded.prompt_zh,
  option_translations = excluded.option_translations,
  explanation = excluded.explanation,
  updated_at = now();

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
