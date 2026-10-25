-- À lancer APRÈS avoir créé la fonction agenda-push et le secret CRON_SECRET.
-- Remplacez MON_SECRET_CRON par la MÊME valeur que le secret CRON_SECRET.
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule('agenda-push') where exists (select 1 from cron.job where jobname='agenda-push');
select cron.schedule('agenda-push','* * * * *', $$
  select net.http_post(
    url:='https://lkbjenepslizldroamsi.supabase.co/functions/v1/agenda-push',
    headers:='{"Content-Type":"application/json","x-cron-secret":"MON_SECRET_CRON"}'::jsonb,
    body:='{}'::jsonb);
$$);
