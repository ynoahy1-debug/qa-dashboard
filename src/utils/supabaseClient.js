import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-public-key'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Convert database snake_case call record to frontend camelCase object
export const formatCallFromDB = (dbCall) => ({
  id: dbCall.id,
  batchId: dbCall.batch_id,
  call_number: dbCall.call_number,
  agent_name: dbCall.agent_name,
  group_name: dbCall.group_name,
  duration_minutes: dbCall.duration_minutes,
  ai_overall_score: Number(dbCall.ai_overall_score || 0),
  flag_reason: dbCall.flag_reason,
  diagnosis_class: dbCall.diagnosis_class,
  diagnosis_score: Number(dbCall.diagnosis_score || 0),
  diagnosis_errors: dbCall.diagnosis_errors,
  case_score: Number(dbCall.case_score || 0),
  case_errors: dbCall.case_errors,
  case_reason: dbCall.case_reason,
  inquiry_class: dbCall.inquiry_class,
  inquiry_score: Number(dbCall.inquiry_score || 0),
  inquiry_errors: dbCall.inquiry_errors,
  inquiry_reason: dbCall.inquiry_reason,
  problem_class: dbCall.problem_class,
  problem_score: Number(dbCall.problem_score || 0),
  problem_errors: dbCall.problem_errors,
  problem_reason: dbCall.problem_reason,
  answer_ending_score: Number(dbCall.answer_ending_score || 0),
  answer_ending_missing: dbCall.answer_ending_missing,
  answer_ending_reason: dbCall.answer_ending_reason,
  comm_score: Number(dbCall.comm_score || 0),
  comm_issue: dbCall.comm_issue,
  comm_reason: dbCall.comm_reason,
  violation_highest_severity: dbCall.violation_highest_severity,
  violation_reasons: dbCall.violation_reasons,
  call_date: dbCall.call_date,
  snapshot_at: dbCall.snapshot_at,

  // QA Audit State
  status: dbCall.status,
  lockedBy: dbCall.locked_by_user_id
    ? { userId: dbCall.locked_by_user_id, userName: dbCall.locked_by_user_name, lockedAt: dbCall.locked_at }
    : null,
  matching: dbCall.matching,
  policy: dbCall.policy,
  description: dbCall.description,
  qa_answer: dbCall.qa_answer !== null ? Number(dbCall.qa_answer) : null,
  qa_skills: dbCall.qa_skills !== null ? Number(dbCall.qa_skills) : null,
  qa_diagnosis: dbCall.qa_diagnosis !== null ? Number(dbCall.qa_diagnosis) : null,
  qa_solve: dbCall.qa_solve !== null ? Number(dbCall.qa_solve) : null,
  qa_inquiries: dbCall.qa_inquiries !== null ? Number(dbCall.qa_inquiries) : null,
  qa_case: dbCall.qa_case !== null ? Number(dbCall.qa_case) : null,
  final_score: dbCall.final_score !== null ? Number(dbCall.final_score) : null,
  evaluatedBy: dbCall.evaluated_by_user_id
    ? { userId: dbCall.evaluated_by_user_id, userName: dbCall.evaluated_by_user_name }
    : null,
  evaluatedAt: dbCall.evaluated_at,
});

// Convert frontend camelCase object to database snake_case record
export const formatCallToDB = (call) => ({
  id: call.id,
  batch_id: call.batchId,
  call_number: String(call.call_number),
  agent_name: call.agent_name,
  group_name: call.group_name,
  duration_minutes: call.duration_minutes,
  ai_overall_score: call.ai_overall_score,
  flag_reason: call.flag_reason,
  diagnosis_class: call.diagnosis_class,
  diagnosis_score: call.diagnosis_score,
  diagnosis_errors: call.diagnosis_errors,
  case_score: call.case_score,
  case_errors: call.case_errors,
  case_reason: call.case_reason,
  inquiry_class: call.inquiry_class,
  inquiry_score: call.inquiry_score,
  inquiry_errors: call.inquiry_errors,
  inquiry_reason: call.inquiry_reason,
  problem_class: call.problem_class,
  problem_score: call.problem_score,
  problem_errors: call.problem_errors,
  problem_reason: call.problem_reason,
  answer_ending_score: call.answer_ending_score,
  answer_ending_missing: call.answer_ending_missing,
  answer_ending_reason: call.answer_ending_reason,
  comm_score: call.comm_score,
  comm_issue: call.comm_issue,
  comm_reason: call.comm_reason,
  violation_highest_severity: call.violation_highest_severity,
  violation_reasons: call.violation_reasons,
  call_date: call.call_date,
  snapshot_at: call.snapshot_at,

  // QA Audit State
  status: call.status,
  locked_by_user_id: call.lockedBy?.userId || null,
  locked_by_user_name: call.lockedBy?.userName || null,
  locked_at: call.lockedBy?.lockedAt || null,
  matching: call.matching || null,
  policy: call.policy || null,
  description: call.description || '',
  qa_answer: call.qa_answer !== undefined ? call.qa_answer : null,
  qa_skills: call.qa_skills !== undefined ? call.qa_skills : null,
  qa_diagnosis: call.qa_diagnosis !== undefined ? call.qa_diagnosis : null,
  qa_solve: call.qa_solve !== undefined ? call.qa_solve : null,
  qa_inquiries: call.qa_inquiries !== undefined ? call.qa_inquiries : null,
  qa_case: call.qa_case !== undefined ? call.qa_case : null,
  final_score: call.final_score !== undefined ? call.final_score : null,
  evaluated_by_user_id: call.evaluatedBy?.userId || null,
  evaluated_by_user_name: call.evaluatedBy?.userName || null,
  evaluated_at: call.evaluatedAt || null,
});
