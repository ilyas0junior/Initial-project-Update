
-- Fix overly permissive UPDATE policy
DROP POLICY "Authenticated users can update agents" ON public.agents;
CREATE POLICY "Authenticated users can update agents"
ON public.agents FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Fix overly permissive DELETE policy
DROP POLICY "Authenticated users can delete agents" ON public.agents;
CREATE POLICY "Authenticated users can delete agents"
ON public.agents FOR DELETE
TO authenticated
USING (auth.uid() = created_by);
