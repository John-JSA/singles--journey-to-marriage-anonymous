-- Run once in Supabase SQL Editor. Names are isolated from other applications.
create table if not exists public.sjm_rooms (
 code text primary key check (code ~ '^[A-F0-9]{8}$'),
 title text not null check (char_length(title) between 1 and 100),
 secret text not null,
 open boolean not null default true
);
create table if not exists public.sjm_questions (
 id uuid primary key,
 room text not null references public.sjm_rooms(code) on delete cascade,
 body text not null check (char_length(body) between 5 and 600),
 status text not null default 'approved' check (status in ('approved','answered')),
 answer text not null default '' check (char_length(answer)<=2000),
 created bigint not null
);
create index if not exists sjm_questions_room_created on public.sjm_questions(room,created desc);
create table if not exists public.sjm_votes (
 id text primary key,
 question uuid not null references public.sjm_questions(id) on delete cascade
);
create index if not exists sjm_votes_question on public.sjm_votes(question);
alter table public.sjm_rooms enable row level security;
alter table public.sjm_questions enable row level security;
alter table public.sjm_votes enable row level security;
create or replace view public.sjm_question_board with (security_invoker=true) as
 select q.id,q.room,q.body,q.status,q.answer,q.created,
 (select count(*) from public.sjm_votes v where v.question=q.id) as votes
 from public.sjm_questions q;
revoke all on public.sjm_rooms, public.sjm_questions, public.sjm_votes, public.sjm_question_board from anon, authenticated;
grant all on public.sjm_rooms, public.sjm_questions, public.sjm_votes to service_role;
grant select on public.sjm_question_board to service_role;
