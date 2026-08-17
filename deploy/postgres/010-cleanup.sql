-- 过期数据清理。由 deploy/cleanup.sh 定期执行。
--
-- user_sessions 和 email_login_codes 都是只增不减的表：会话按 30 天过期，
-- 验证码按 10 分钟过期，但过期行不会自动消失。长期积累会让登录时的
-- token 查询变慢，也没有必要继续保留已失效的凭据。

begin;

-- 已过期的会话。删除后对应用户需要重新登录，属于预期行为。
delete from user_sessions where expires_at < now();

-- 验证码保留 24 小时再删，而不是一过期就删：
-- request-code 接口用 24 小时内的记录数来限制单个邮箱的发码次数，
-- 删太早会让这道防轰炸的闸门失效。
delete from email_login_codes where created_at < now() - interval '24 hours';

-- 没有任何练习记录的匿名账号。这类账号来自只打开过页面、
-- 没有作答就离开的访问，会话失效后再也不会被用到。
delete from app_users u
where u.is_anonymous
  and u.created_at < now() - interval '30 days'
  and not exists (select 1 from practice_attempts a where a.user_id = u.id)
  and not exists (select 1 from user_sessions s where s.user_id = u.id);

commit;
