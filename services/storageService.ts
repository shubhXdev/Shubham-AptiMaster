import { ExamResult, Subject } from "../types";

const STORAGE_KEY = 'shubham_aptimaster_history';

export const saveExamResult = (result: ExamResult): void => {
  try {
    const existing = getExamHistory();
    existing.push(result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Failed to save result", e);
  }
};

export const getExamHistory = (): ExamResult[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getSubjectAttemptCount = (subject: Subject): number => {
  const history = getExamHistory();
  return history.filter(h => h.subject === subject).length;
};

export const getTotalAttempts = (): number => {
  return getExamHistory().length;
};
