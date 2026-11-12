begin;
create table public.data_sources (
 id text primary key, name text not null, url text not null, version text not null, license text not null, attribution text not null
);
create table public.import_batches (
 id uuid primary key default gen_random_uuid(), source_id text references public.data_sources(id),
 created_at timestamptz not null default now(), report jsonb not null default '{}'
);
create table public.lessons (
 id text primary key, upstream_id text not null, source_id text not null references public.data_sources(id),
 level text not null check (level in ('n1','n2')), category text not null check (category in ('grammar','vocabulary')),
 japanese text not null, reading text not null default '', meanings_en text not null, meaning_zh text,
 formation text not null default '', notes_en text not null default '', notes_zh text,
 pos text[] not null default '{}', other_forms text[] not null default '{}', translation_machine boolean not null default false,
 updated_at timestamptz not null default now(), unique(source_id, category, level, upstream_id)
);
create index lessons_browse on public.lessons(level,category,id);
create table public.examples (
 id text primary key, lesson_id text not null references public.lessons(id) on delete cascade,
 position integer not null, ja text not null, en text not null default '', zh text,
 furigana text, source_url text, unique(lesson_id,position)
);
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade, display_name text not null default '', created_at timestamptz not null default now()
);
create table public.voice_tasks (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, status text not null default 'queued' check(status in ('queued','transcribing','translating','completed','failed')),
 progress integer not null default 0 check(progress between 0 and 100), duration real not null check(duration > 0 and duration <= 1800),
 segments jsonb not null default '[]', original_text text not null default '', japanese_text text not null default '',
 error text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index voice_tasks_owner on public.voice_tasks(user_id,created_at desc);
create function public.create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles(id) values(new.id); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile();
alter table public.data_sources enable row level security;
alter table public.import_batches enable row level security;
alter table public.lessons enable row level security;
alter table public.examples enable row level security;
alter table public.profiles enable row level security;
alter table public.voice_tasks enable row level security;
create policy sources_read on public.data_sources for select to anon,authenticated using(true);
create policy lessons_read on public.lessons for select to anon,authenticated using(true);
create policy examples_read on public.examples for select to anon,authenticated using(true);
create policy profile_read on public.profiles for select to authenticated using((select auth.uid())=id);
create policy profile_update on public.profiles for update to authenticated using((select auth.uid())=id) with check((select auth.uid())=id);
create policy voice_read on public.voice_tasks for select to authenticated using((select auth.uid())=user_id);
-- Voice mutations are only exposed through the authenticated Node API, which also owns temporary files.
revoke all on public.import_batches,public.voice_tasks from anon,authenticated;
grant select on public.voice_tasks to authenticated;
grant select on public.lessons,public.examples,public.data_sources to anon,authenticated;
grant select,update on public.profiles to authenticated;
commit;
