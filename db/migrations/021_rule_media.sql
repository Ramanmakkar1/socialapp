alter table socialapp.dm_rules add column if not exists media_ids text[] not null default '{}';
alter table socialapp.dm_rules add column if not exists link_label text not null default 'Open link';
