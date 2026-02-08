-- Add scheduled_email_id to applications table
ALTER TABLE public.applications 
ADD COLUMN scheduled_email_id text;

-- Add index for potential lookups
CREATE INDEX idx_applications_scheduled_email ON public.applications(scheduled_email_id);
