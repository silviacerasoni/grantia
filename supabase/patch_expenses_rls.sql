-- Allow public access to expenses for Demo Mode
CREATE POLICY "Public access to expenses" ON expenses
    FOR ALL USING (true) WITH CHECK (true);
