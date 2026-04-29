-- Support tickets table for contact form and refund/cancellation requests
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  ticket_type TEXT NOT NULL DEFAULT 'contact', -- contact | refund | cancellation
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_number TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  -- Refund specific
  transaction_id TEXT,
  purchase_date DATE,
  -- Admin fields
  status TEXT NOT NULL DEFAULT 'new', -- new | in_progress | resolved | closed
  priority TEXT NOT NULL DEFAULT 'medium', -- low | medium | high
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Authenticated users can create their own tickets
CREATE POLICY "Users create their own tickets"
  ON public.support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view their own tickets
CREATE POLICY "Users view their own tickets"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Admins/moderators can update
CREATE POLICY "Admins update tickets"
  ON public.support_tickets
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Admins can delete
CREATE POLICY "Admins delete tickets"
  ON public.support_tickets
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER support_tickets_set_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_type ON public.support_tickets(ticket_type);