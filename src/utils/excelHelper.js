import * as XLSX from 'xlsx';

/**
 * Parses an Excel file (.xlsx, .xls, .csv) into array of call objects for a specific batchId
 */
export const parseExcelFile = (file, batchId) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const mappedCalls = rawJson.map((row, index) => {
          const callNum = String(row['call_number'] || row['Call Number'] || (1000 + index + 1));
          
          return {
            id: `CALL-${batchId}-${callNum}`,
            batchId: batchId,
            call_number: callNum,
            agent_name: String(row['agent_name'] || row['Agent'] || 'Unassigned'),
            group_name: String(row['group_name'] || row['Team Leader'] || 'General'),
            duration_minutes: formatDuration(row['duration_minutes'] || row['Duration'] || '00:00'),
            ai_overall_score: Number(row['ai_overall_score'] || 0),
            flag_reason: String(row['flag_reason'] || 'None'),
            diagnosis_class: String(row['diagnosis_class'] || '-'),
            diagnosis_score: Number(row['diagnosis_score'] || 0),
            diagnosis_errors: String(row['diagnosis_errors'] || 'None'),
            case_score: Number(row['case_score'] || 0),
            case_errors: String(row['case_errors'] || 'None'),
            case_reason: String(row['case_reason'] || 'None'),
            inquiry_class: String(row['inquiry_class'] || '-'),
            inquiry_score: Number(row['inquiry_score'] || 0),
            inquiry_errors: String(row['inquiry_errors'] || 'None'),
            inquiry_reason: String(row['inquiry_reason'] || 'None'),
            problem_class: String(row['problem_class'] || '-'),
            problem_score: Number(row['problem_score'] || 0),
            problem_errors: String(row['problem_errors'] || 'None'),
            problem_reason: String(row['problem_reason'] || 'None'),
            answer_ending_score: Number(row['answer_ending_score'] || 0),
            answer_ending_missing: String(row['answer_ending_missing'] || 'None'),
            answer_ending_reason: String(row['answer_ending_reason'] || 'None'),
            comm_score: Number(row['comm_score'] || 0),
            comm_issue: String(row['comm_issue'] || 'None'),
            comm_reason: String(row['comm_reason'] || 'None'),
            violation_highest_severity: String(row['violation_highest_severity'] || 'None'),
            violation_reasons: String(row['violation_reasons'] || 'None'),
            call_date: String(row['call_date'] || new Date().toISOString().slice(0, 10)),
            snapshot_at: String(row['snapshot_at'] || new Date().toISOString().slice(0, 19).replace('T', ' ')),

            // QA State
            status: row['matching'] ? 'completed' : 'unlocked',
            lockedBy: null,
            matching: row['matching'] || null,
            policy: row['policy'] || row['Policy'] || null,
            description: row['description'] || row['Description'] || '',
            qa_answer: row['answer'] !== undefined && row['answer'] !== '' ? Number(row['answer']) : null,
            qa_skills: row['skills'] !== undefined && row['skills'] !== '' ? Number(row['skills']) : null,
            qa_diagnosis: (row['dignosis'] !== undefined && row['dignosis'] !== '') || (row['diagnosis'] !== undefined && row['diagnosis'] !== '') ? Number(row['dignosis'] || row['diagnosis']) : null,
            qa_solve: row['solve'] !== undefined && row['solve'] !== '' ? Number(row['solve']) : null,
            qa_inquiries: row['inquiries'] !== undefined && row['inquiries'] !== '' ? Number(row['inquiries']) : null,
            qa_case: row['case'] !== undefined && row['case'] !== '' ? Number(row['case']) : null,
            final_score: (row['final_score'] !== undefined && row['final_score'] !== '') || (row['final score'] !== undefined && row['final score'] !== '') ? Number(row['final_score'] || row['final score']) : null,
            evaluatedBy: row['qa_evaluator'] ? { userName: row['qa_evaluator'] } : null,
            evaluatedAt: row['qa_evaluated_at'] || null,
          };
        });

        resolve(mappedCalls);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const formatDuration = (val) => {
  if (typeof val === 'number') {
    const mins = Math.floor(val);
    const secs = Math.round((val - mins) * 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  const str = String(val).trim();
  if (str.includes(':')) return str;
  const num = parseFloat(str);
  if (!isNaN(num)) {
    const mins = Math.floor(num);
    const secs = Math.round((num - mins) * 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return '00:00';
};

export const exportCallsToExcel = (calls, filename = 'QA_Call_Evaluations_Report.xlsx') => {
  const exportData = calls.map((c) => ({
    'call_number': c.call_number,
    'agent_name': c.agent_name,
    'group_name': c.group_name,
    'duration_minutes': c.duration_minutes,
    'ai_overall_score': c.ai_overall_score,
    'flag_reason': c.flag_reason,
    'diagnosis_class': c.diagnosis_class,
    'diagnosis_score': c.diagnosis_score,
    'diagnosis_errors': c.diagnosis_errors,
    'case_score': c.case_score,
    'case_errors': c.case_errors,
    'case_reason': c.case_reason,
    'inquiry_class': c.inquiry_class,
    'inquiry_score': c.inquiry_score,
    'inquiry_errors': c.inquiry_errors,
    'inquiry_reason': c.inquiry_reason,
    'problem_class': c.problem_class,
    'problem_score': c.problem_score,
    'problem_errors': c.problem_errors,
    'problem_reason': c.problem_reason,
    'answer_ending_score': c.answer_ending_score,
    'answer_ending_missing': c.answer_ending_missing,
    'answer_ending_reason': c.answer_ending_reason,
    'comm_score': c.comm_score,
    'comm_issue': c.comm_issue,
    'comm_reason': c.comm_reason,
    'violation_highest_severity': c.violation_highest_severity,
    'violation_reasons': c.violation_reasons,
    'call_date': c.call_date,
    'snapshot_at': c.snapshot_at,
    
    // QA Evaluation Fields
    'matching': c.matching || 'Pending',
    'Policy': c.policy || '-',
    'Description': c.description || '',
    'answer': c.qa_answer !== null ? c.qa_answer : '',
    'skills': c.qa_skills !== null ? c.qa_skills : '',
    'dignosis': c.qa_diagnosis !== null ? c.qa_diagnosis : '',
    'solve': c.qa_solve !== null ? c.qa_solve : '',
    'inquiries': c.qa_inquiries !== null ? c.qa_inquiries : '',
    'case': c.qa_case !== null ? c.qa_case : '',
    'final score': c.final_score !== null ? c.final_score : '',
    'qa_evaluator': c.evaluatedBy ? c.evaluatedBy.userName : (c.lockedBy ? c.lockedBy.userName : '-'),
    'qa_status': c.status === 'completed' ? 'Completed' : (c.status === 'locked' ? 'In Progress' : 'New'),
    'qa_evaluated_at': c.evaluatedAt || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'QA Evaluations');
  
  XLSX.writeFile(workbook, filename);
};
