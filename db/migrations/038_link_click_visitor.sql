-- Unique link clicks: an anonymous visitor fingerprint (sha256 of code + IP + user agent, truncated).
-- Older rows keep visitor_hash null and each counts as one unique click.
begin;
alter table socialapp.link_clicks add column if not exists visitor_hash text;
create index if not exists link_clicks_code_visitor_idx on socialapp.link_clicks (code, visitor_hash);
commit;
