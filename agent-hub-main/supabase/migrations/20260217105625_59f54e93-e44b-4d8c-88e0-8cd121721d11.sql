
-- Create partenariats table
CREATE TABLE public.partenariats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  type_partenariat TEXT NOT NULL DEFAULT 'convention',
  nature TEXT NOT NULL DEFAULT '',
  domaine TEXT NOT NULL DEFAULT '',
  entite_cnss TEXT NOT NULL DEFAULT 'entite_centrale',
  partenaire TEXT NOT NULL DEFAULT '',
  date_debut DATE,
  date_fin DATE,
  statut TEXT NOT NULL DEFAULT 'en_cours',
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partenariats ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view partenariats"
ON public.partenariats FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert partenariats"
ON public.partenariats FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their partenariats"
ON public.partenariats FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their partenariats"
ON public.partenariats FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_partenariats_updated_at
BEFORE UPDATE ON public.partenariats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
