-- RLS policies for notifications table to allow marking as read and org-admin level notifications creation/management
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Org admins can manage notifications for their organization" ON public.notifications
    FOR ALL
    TO authenticated
    USING (is_org_admin() AND organization_id = get_my_organization_id())
    WITH CHECK (is_org_admin() AND organization_id = get_my_organization_id());
