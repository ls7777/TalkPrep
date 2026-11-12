begin;
create table public.learning_history (
 user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id text not null references public.lessons(id) on delete cascade,
 viewed_at timestamptz not null default now(),
 primary key(user_id,lesson_id)
);
create table public.favorites (
 user_id uuid not null references auth.users(id) on delete cascade,
 lesson_id text not null references public.lessons(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,lesson_id)
);
create index learning_history_recent on public.learning_history(user_id,viewed_at desc);
create index favorites_recent on public.favorites(user_id,created_at desc);
alter table public.learning_history enable row level security;
alter table public.favorites enable row level security;
revoke all on public.learning_history,public.favorites from anon;
grant select,insert,update,delete on public.learning_history,public.favorites to authenticated;
create policy history_own on public.learning_history for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy favorites_own on public.favorites for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
commit;
