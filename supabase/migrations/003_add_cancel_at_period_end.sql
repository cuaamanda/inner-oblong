
-- Add cancel_at_period_end column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;

-- Add index for querying cancelled-pending subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_cancel_at_period_end ON public.subscriptions(cancel_at_period_end);
