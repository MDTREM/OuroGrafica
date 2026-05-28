-- Migration: Create CRM Leads Table
-- Date: 2026-05-28
-- Description: Table to store lead relationship data for CRM.

CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    whatsapp TEXT,
    email TEXT,
    segment TEXT,
    cpf_cnpj TEXT,
    address TEXT,
    observations TEXT,
    status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'cliente', 'recorrente', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- Drop policies if exist
DROP POLICY IF EXISTS "everyone_can_select_leads" ON public.crm_leads;
DROP POLICY IF EXISTS "authenticated_can_insert_leads" ON public.crm_leads;
DROP POLICY IF EXISTS "authenticated_can_update_leads" ON public.crm_leads;
DROP POLICY IF EXISTS "authenticated_can_delete_leads" ON public.crm_leads;

-- Create policies for authenticated admins
CREATE POLICY "everyone_can_select_leads" 
ON public.crm_leads FOR SELECT 
USING (true);

CREATE POLICY "authenticated_can_insert_leads" 
ON public.crm_leads FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "authenticated_can_update_leads" 
ON public.crm_leads FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "authenticated_can_delete_leads" 
ON public.crm_leads FOR DELETE 
TO authenticated 
USING (true);
