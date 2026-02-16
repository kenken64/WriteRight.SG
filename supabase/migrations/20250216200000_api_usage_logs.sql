-- API usage tracking for OpenAI calls
create table if not exists api_usage_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submission_id uuid references submissions(id) on delete set null,
  user_id uuid,
  operation text not null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_usd numeric not null default 0,
  duration_ms integer not null default 0,
  status text not null default 'success',
  error_message text
);

-- Index for querying by date range and operation
create index idx_api_usage_logs_created_at on api_usage_logs (created_at);
create index idx_api_usage_logs_operation on api_usage_logs (operation);
create index idx_api_usage_logs_user_id on api_usage_logs (user_id);
