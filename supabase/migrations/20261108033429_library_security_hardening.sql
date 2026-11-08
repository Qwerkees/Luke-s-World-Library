-- Tighten grants and optimize owner-scoped policies.
REVOKE ALL PRIVILEGES ON TABLE
  public.library_divisions,
  public.library_resources
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE
  public.library_divisions,
  public.library_resources
TO anon, authenticated;

REVOKE ALL PRIVILEGES ON TABLE
  public.user_profiles,
  public.private_library_items,
  public.saved_resources,
  public.research_notes
FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.private_library_items,
  public.saved_resources,
  public.research_notes
TO authenticated;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can read their own profile"
  ON public.user_profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage their own private library items" ON public.private_library_items;
CREATE POLICY "Users manage their own private library items"
  ON public.private_library_items FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Users manage their own saved resources" ON public.saved_resources;
CREATE POLICY "Users manage their own saved resources"
  ON public.saved_resources FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage their own research notes" ON public.research_notes;
CREATE POLICY "Users manage their own research notes"
  ON public.research_notes FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE INDEX IF NOT EXISTS saved_resources_resource_id_idx
  ON public.saved_resources (resource_id);
