-- Add a unique constraint to public.assessment_reports on assessment_submission_id
-- to enable standard conflict resolution (UPSERT) on report generation.
ALTER TABLE public.assessment_reports 
ADD CONSTRAINT assessment_reports_assessment_submission_id_key UNIQUE (assessment_submission_id);
