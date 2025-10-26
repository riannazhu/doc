# SQL table definitions (reference only)
# Run these in Supabase SQL Editor

SQL_SETUP = """
-- Enable pgvector
create extension if not exists vector;

-- Core tables
create table if not exists document (
  document_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  file_name text not null,
  storage_path text not null,
  detected_doc_type text,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

create table if not exists document_page (
  page_id uuid primary key default gen_random_uuid(),
  document_id uuid not null references document(document_id) on delete cascade,
  page_number int not null,
  page_text text not null
);

create table if not exists document_embedding (
  embedding_id uuid primary key default gen_random_uuid(),
  document_id uuid not null references document(document_id) on delete cascade,
  page_number int not null,
  embedding vector(1536) not null  -- use 1536 for text-embedding-3-small
);

create index if not exists document_embedding_ivf
  on document_embedding using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create table if not exists extracted_fact (
  fact_id uuid primary key default gen_random_uuid(),
  document_id uuid not null references document(document_id) on delete cascade,
  fact_type text not null,             -- 'amount_due_cents' | 'due_date_iso' | 'counterparty_name' | 'late_fee_rule'
  fact_value jsonb not null,
  confidence numeric,
  source_page int,
  source_quote text
);

create table if not exists obligation (
  obligation_id uuid primary key default gen_random_uuid(),
  document_id uuid not null references document(document_id) on delete cascade,
  obligation_type text not null,       -- 'payment' | 'dispute'
  title text not null,
  due_date date,
  amount_cents int,
  counterparty_name text,
  status text not null default 'open',
  confidence numeric
);
"""

