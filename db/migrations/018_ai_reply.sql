begin;

alter table socialapp.social_accounts add column if not exists ai_reply_enabled boolean not null default false;
alter table socialapp.social_accounts add column if not exists ai_reply_instructions text;
alter table socialapp.social_accounts add column if not exists ai_booking_link text;

commit;
