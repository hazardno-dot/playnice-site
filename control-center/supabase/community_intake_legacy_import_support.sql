-- Historical import support for Community Intake v1.
-- Legacy rows predate device IDs. They remain auditable without inventing users.

alter table public.scent_requests
  alter column device_id drop not null;
alter table public.journal_feedback
  alter column device_id drop not null;

alter table public.scent_requests
  add column if not exists legacy_sheet_row integer;
alter table public.journal_feedback
  add column if not exists legacy_sheet_row integer;

create unique index if not exists scent_requests_legacy_sheet_row_uidx
  on public.scent_requests (legacy_sheet_row)
  where legacy_sheet_row is not null;

create unique index if not exists journal_feedback_legacy_sheet_row_uidx
  on public.journal_feedback (legacy_sheet_row)
  where legacy_sheet_row is not null;
