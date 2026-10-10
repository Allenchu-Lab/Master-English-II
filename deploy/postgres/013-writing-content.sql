begin;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2010 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2011 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2012 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2013 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2014 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2015 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2016 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2017 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2018 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2019 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2020 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2021 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2022 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2023 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2024 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2025 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into exam_sections (paper_id, type, item_count, position, status) select id, 'writing', 2, 5, 'published' from exam_papers where year = 2026 on conflict (paper_id, type) do update set item_count = excluded.item_count, position = excluded.position, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'You have just come back from the U.S. as a member of a Sino-American cultural exchange program. Write a letter to your American colleague to
1) express your thanks for his/her warm reception;
2) welcome him/her to visit China in due course.

You should write about 100 words on the ANSWER SHEET.
Do not sign your own name at the end of the letter. Use “Zhang Wei” instead.
Do not write your address.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2010 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'In this section, you are asked to write an essay based on the following chart. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write at least 150 words.
Write your essay on the ANSWER SHEET.', 150, 15, '{"type":"stacked","title":"Mobile-phone Subscriptions (2000-2008)","unit":"billion","showValues":false,"categories":["2000","2001","2002","2003","2004","2005","2006","2007","2008"],"series":[{"name":"Developing countries","values":[0.2,0.3,0.4,0.6,0.9,1.2,1.8,2.3,3]},{"name":"Developed countries","values":[0.5,0.6,0.7,0.8,0.9,0.9,1,1,1]}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2010 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose your cousin Li Ming has just been admitted to a university. Write him/her a letter to
1) congratulate him/her, and
2) give him/her suggestions on how to get prepared for university life.

You should write about 100 words on the ANSWER SHEET.
Do not sign your own name at the end of the letter. Use “Zhang Wei” instead.
Do not write the address.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2011 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the following chart. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write at least 150 words.
Write your essay on the ANSWER SHEET.', 150, 15, '{"type":"grouped","title":"2008、2009年国内轿车市场部分品牌市场份额示意图","unit":"%","showValues":false,"categories":["2008年","2009年"],"series":[{"name":"国产品牌","values":[26,32]},{"name":"日系品牌","values":[35,26]},{"name":"美系品牌","values":[14,14]}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2011 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose you have found something wrong with the electronic dictionary that you bought from an online store the other day. Write an email to the customer service center to
1) make a complaint, and
2) demand a prompt solution.

You should write about 100 words on the ANSWER SHEET.
Do not sign your own name at the end of the letter. Use “Zhang Wei” instead.
Do not write the address.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2012 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the following table. In your writing, you should
1) describe the table, and
2) give your comments.

You should write at least 150 words.
Write your essay on the ANSWER SHEET.', 150, 15, '{"type":"table","title":"某公司员工工作满意度调查","columns":["年龄组","满意","不清楚","不满意"],"rows":[["≤40 岁","16.7%","50.0%","33.3%"],["41-50 岁","0.0%","36.0%","64.0%"],[">50 岁","40.0%","50.0%","10.0%"]]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2012 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose your class is to hold a charity sale for kids in need of help. Write your classmates an email to
1) inform them about the details, and
2) encourage them to participate.

You should write about 100 words on the ANSWER SHEET.
Do not use your own name. Use “Li Ming” instead.
Do not write your address.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2013 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the following chart. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"bar","title":"某高校学生兼职情况","unit":"%","items":[{"label":"大一","value":67.77},{"label":"大二","value":71.13},{"label":"大三","value":71.93},{"label":"大四","value":88.24}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2013 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose you are going to study abroad and share an apartment with John, a local student. Write him an email to
1) tell him about your living habits, and
2) ask for advice about living there.

You should write about 100 words on the ANSWER SHEET.
Do not use your own name. Use “Li Ming” instead.
Do not write your address.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2014 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the following chart. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"grouped","title":"20年间中国城镇人口与乡村人口变化图","unit":"百万","categories":["1990年","2000年","2010年"],"series":[{"name":"城镇人口","values":[300,458,666]},{"name":"乡村人口","values":[834,807,674]}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2014 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose your university is going to host a summer camp for high school students. Write a notice to
1) briefly introduce the camp activities, and
2) call for volunteers.

You should write about 100 words on the ANSWER SHEET.
Do not use your name or the name of your university.
Do not write your address.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2015 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the following chart. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"pie","title":"我国某市居民春节假期花销比例","unit":"%","items":[{"label":"新年礼物","value":40},{"label":"交通","value":20},{"label":"聚会吃饭","value":20},{"label":"其他","value":20}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2015 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose you won a translation contest and your friend, Jack, wrote an email to congratulate you and ask for advice on translation. Write him a reply to
1) thank him, and
2) give your advice.

You should write about 100 words on the ANSWER SHEET.
Do not use your own name. Use “Li Ming” instead.
Do not write your address.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2016 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the chart below. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"pie","title":"某高校学生旅游目的调查","unit":"%","items":[{"label":"欣赏风景","value":37},{"label":"缓解压力","value":33},{"label":"广交朋友","value":9},{"label":"培养独立能力","value":6},{"label":"其他","value":15}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2016 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose you are invited by Professor Williams to give a presentation about Chinese culture to a group of international students. Write a reply to
1) accept the invitation, and
2) introduce the key points of your presentation.

You should write about 100 words on the ANSWER SHEET.
Do not use your own name. Use “Li Ming” instead.
Do not write your address.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2017 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the chart below. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"line","title":"2013-2015年我国博物馆数量和参观人数","unit":"数量","categories":["2013","2014","2015"],"series":[{"name":"博物馆数量（家）","values":[4165,4510,4692]},{"name":"参观人数（十万人次）","values":[6378,7177,7811]}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2017 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose you have to cancel your travel plan and will not be able to visit Professor Smith. Write him an email to
1) apologize and explain the situation, and
2) suggest a future meeting.

You should write about 100 words on the ANSWER SHEET.
Do not use your own name. Use “Li Ming” instead.
Do not write your address.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2018 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the chart below. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"pie","title":"2017年某市消费者选择餐厅时的关注因素","unit":"%","items":[{"label":"特色","value":36.3},{"label":"服务","value":26.8},{"label":"环境","value":23.8},{"label":"价格","value":8.4},{"label":"其他","value":4.7}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2018 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose Professor Smith asked you to plan a debate on the theme of city traffic. Write an email to
1) suggest a specific topic with your reasons, and
2) tell him about your arrangements.

You should write about 100 words on the ANSWER SHEET.
Do not use your own name. Use “Li Ming” instead.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2019 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the chart below. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"grouped","title":"某高校2013和2018年本科毕业生去向统计","unit":"%","categories":["就业","升学","创业"],"series":[{"name":"2013","values":[68.1,26.3,1.3]},{"name":"2018","values":[60.7,34,2.6]}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2019 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose you are planning a tour of a historical site for a group of international students. Write them an email to
1) tell them about the site, and
2) give them some tips for the tour.

You should write about 100 words on the ANSWER SHEET.
Do not use your own name. Use “Li Ming” instead.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2020 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the chart below. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"pie","title":"某高校学生手机阅读目的调查","unit":"%","items":[{"label":"学习知识","value":59.5},{"label":"消磨时间","value":21.3},{"label":"获取信息","value":17},{"label":"其他","value":2.2}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2020 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose you are organizing an online meeting. Write an email to Jack, an international student, to
1) invite him to participate, and
2) tell him about the details.

You should write about 100 words on the ANSWER SHEET.
Do not use your own name. Use “Li Ming” instead.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2021 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the chart below. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"bar","title":"某市居民体育锻炼方式调查","unit":"%","items":[{"label":"独自锻炼","value":54.3},{"label":"和朋友一起","value":47.7},{"label":"和家人一起","value":23.9},{"label":"团体活动","value":15.8}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2021 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose you are planning a campus food festival. Write an email to the international students in your university to
1) introduce the food festival, and
2) invite them to participate.

You should write about 100 words on the ANSWER SHEET.
Do not use your own name. Use “Li Ming” instead.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2022 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the chart below. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"grouped","title":"2018-2020年我国快递业务量变动情况（单位：10亿件）","unit":"10亿件","categories":["2018年","2019年","2020年"],"series":[{"name":"总体","values":[51,64,83]},{"name":"农村","values":[12,15,30]}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2022 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'An art exhibition and a robot show are to be held on Sunday, and your friend David asks you which one he should go to. Write him an email to
1) make a suggestion, and
2) give your reason(s).

Write your answer in about 100 words on the ANSWER SHEET.
Do not use your own name in your email; use “Li Ming” instead.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2023 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the chart below. In your writing, you should
1) interpret the chart, and
2) give your comments.

You should write about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"line","title":"2012-2021年我国居民健康素养水平","unit":"%","note":"健康素养（health literacy）是指个人获取和理解基本健康信息和服务，并运用这些信息和服务做出正确决策，以维护和促进自身健康的能力。健康素养水平指具备基本健康素养的人在总人群（15-69岁城乡居民）中所占的比例。","categories":["2012","2013","2014","2015","2016","2017","2018","2019","2020","2021"],"series":[{"name":"健康素养水平","values":[8.8,9.48,9.79,10.25,11.58,14.18,17.06,19.17,23.15,25.4]}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2023 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose you and Jack are going to do a survey on the protection of old houses in an ancient town. Write him an email to
1) put forward your plan, and
2) ask for his opinion.

Write your answer in about 100 words on the ANSWER SHEET.
Do not use your own name in your email; use “Li Ming” instead.', 100, 10, null, 13, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2024 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the chart below. In your writing, you should
1) describe and interpret the chart, and
2) give your comments.

Write your answer in about 150 words on the ANSWER SHEET.', 150, 15, '{"type":"bar","title":"某高校劳动实践课学生主要收获调查","unit":"%","items":[{"label":"学习了相关知识","value":91.3},{"label":"提升了动手能力","value":84.8},{"label":"感觉到心情舒畅","value":54.4},{"label":"提升了合作能力","value":32.6}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2024 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose you are planning a short play based on a classic Chinese novel. Write your friend John an email to:
1) introduce the play, and
2) invite him to take part in it.

Write your answer in about 100 words on the ANSWER SHEET.
Do not use your own name in your email. Use “Li Ming” instead.', 100, 10, null, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2025 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the chart below. In your essay, you should
1) describe and interpret the chart, and
2) give your comments.

Write your answer in about 150 words on the ANSWER SHEET.', 150, 15, '{"title":"某社区老年人主要日常休闲活动调查","unit":"%","items":[{"label":"看电视","value":90.8},{"label":"散步","value":68.3},{"label":"养花","value":34.7},{"label":"阅读","value":31.8},{"label":"下棋","value":18.4}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2025 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'A', 47, 'Suppose your friend Jack has shared with you a video of his family’s travel in China. Write an email to tell him
1) how you feel about the video, and
2) your wish to learn more about their travel.

Write your answer in about 100 words on the ANSWER SHEET.
Do not use your own name in your email. Use “Li Ming” instead.', 100, 10, null, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2026 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status) select s.id, 'B', 48, 'Write an essay based on the chart below. In your essay, you should
1) describe and interpret the chart, and
2) give your comments.

Write your answer in about 150 words on the ANSWER SHEET.', 150, 15, '{"title":"某项关于儿童户外活动看法的调查","unit":"%","items":[{"label":"满足好奇心","value":54.6},{"label":"促进观察力","value":54.5},{"label":"强身健体","value":37.2},{"label":"增强亲子互动","value":33.2}]}'::jsonb, 14, 'published' from exam_sections s join exam_papers p on p.id = s.paper_id where p.year = 2026 and s.type = 'writing' on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words, points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;
commit;
