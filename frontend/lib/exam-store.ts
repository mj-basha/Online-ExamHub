export type QuestionType = 'true_false' | 'multiple_choice'

export interface ExamQuestion {
  id: string
  type: QuestionType
  prompt: string
  // true/false
  answerBool?: boolean
  // multiple choice
  options?: string[]
  correctIndex?: number
}

export interface Exam {
  code: string
  questions: ExamQuestion[]
  createdAt: string
}

const STORAGE_KEY = 'exam_platform_published_exams'

/** Normalizes a code so lookups are case-insensitive and trimmed. */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

function readAll(): Record<string, Exam> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Exam>) : {}
  } catch {
    return {}
  }
}

function writeAll(exams: Record<string, Exam>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exams))
}

/** Publishes (or overwrites) an exam under the given code. */
export function saveExam(code: string, questions: ExamQuestion[]): Exam {
  const normalized = normalizeCode(code)
  const exam: Exam = {
    code: normalized,
    questions,
    createdAt: new Date().toISOString(),
  }
  const all = readAll()
  all[normalized] = exam
  writeAll(all)
  return exam
}

/** Returns the published exam for a code, or null if none exists. */
export function getExam(code: string): Exam | null {
  const all = readAll()
  return all[normalizeCode(code)] ?? null
}

/** Checks whether an exam exists for the given code. */
export function examExists(code: string): boolean {
  return getExam(code) !== null
}
