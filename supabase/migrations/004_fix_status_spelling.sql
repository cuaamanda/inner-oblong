-- Fix spelling of canceled (from cancelled to canceled) to match Stripe status
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'inactive'));

-- Update any existing 'cancelled' records to 'canceled' if they exist
UPDATE public.subscriptions SET status = 'canceled' WHERE status = 'cancelled';
