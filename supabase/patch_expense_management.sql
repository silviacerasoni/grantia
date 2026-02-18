-- NEW TABLE: Project Budget Categories
CREATE TABLE IF NOT EXISTS project_budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g., "Travel", "Personnel"
    allocated_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE project_budget_categories ENABLE ROW LEVEL SECURITY;

-- Demo Mode Policy (Allow public access for now)
CREATE POLICY "Public access to budget_categories" ON project_budget_categories
    FOR ALL USING (true) WITH CHECK (true);

-- Update Expenses Table to link to categories
-- We keep the text 'category' column for backward compatibility/display, 
-- but 'category_id' will link to the strict budget item.
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES project_budget_categories(id);
