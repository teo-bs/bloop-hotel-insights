-- Create integrations management tables
CREATE TYPE integration_type AS ENUM ('csv', 'api');
CREATE TYPE integration_status AS ENUM ('not_connected', 'connected', 'error', 'syncing');
CREATE TYPE import_job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- Main integrations table
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL, -- 'google', 'tripadvisor', 'booking'
  type integration_type NOT NULL DEFAULT 'csv',
  status integration_status NOT NULL DEFAULT 'not_connected',
  last_sync_at timestamp with time zone,
  total_reviews integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, type)
);

-- Integration accounts (for API connections)
CREATE TABLE public.integration_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  account_name text,
  account_id text,
  credentials_encrypted text, -- encrypted API keys/tokens
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Import jobs for CSV uploads
CREATE TABLE public.import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  filename text NOT NULL,
  file_size integer,
  total_rows integer,
  processed_rows integer DEFAULT 0,
  imported_rows integer DEFAULT 0,
  failed_rows integer DEFAULT 0,
  status import_job_status NOT NULL DEFAULT 'pending',
  column_mapping jsonb DEFAULT '{}',
  error_message text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Import errors for tracking row-level issues
CREATE TABLE public.import_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id uuid NOT NULL REFERENCES public.import_jobs(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  error_type text NOT NULL,
  error_message text NOT NULL,
  row_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integrations
CREATE POLICY "Users can manage own integrations" ON public.integrations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for integration_accounts
CREATE POLICY "Users can manage own integration accounts" ON public.integration_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.integrations 
      WHERE integrations.id = integration_accounts.integration_id 
      AND integrations.user_id = auth.uid()
    )
  );

-- RLS Policies for import_jobs
CREATE POLICY "Users can manage own import jobs" ON public.import_jobs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for import_errors  
CREATE POLICY "Users can view own import errors" ON public.import_errors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.import_jobs 
      WHERE import_jobs.id = import_errors.import_job_id 
      AND import_jobs.user_id = auth.uid()
    )
  );

-- Add updated_at triggers
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_integration_accounts_updated_at
  BEFORE UPDATE ON public.integration_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_import_jobs_updated_at
  BEFORE UPDATE ON public.import_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes for performance
CREATE INDEX idx_integrations_user_platform ON public.integrations(user_id, platform);
CREATE INDEX idx_import_jobs_user_status ON public.import_jobs(user_id, status);
CREATE INDEX idx_import_jobs_integration ON public.import_jobs(integration_id);
CREATE INDEX idx_import_errors_job ON public.import_errors(import_job_id);