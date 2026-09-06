export type ExamType =
  | 'JEE Main'
  | 'JEE Advanced'
  | 'NEET-UG'
  | 'CAT (IIM)'
  | 'UPSC CSAT'
  | 'CBSE Class 12';

export type Subject =
  | 'Physics'
  | 'Chemistry'
  | 'Mathematics'
  | 'Biology'
  | 'Quantitative Aptitude'
  | 'Data Interpretation & LR'
  | 'Verbal Ability & RC';

export type QuestionType =
  | 'mcq'
  | 'numerical'
  | 'assertion_reason'
  | 'subjective';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Olympiad';

export type BloomsLevel =
  | 'Remember'
  | 'Understand'
  | 'Apply'
  | 'Application'
  | 'Analyze'
  | 'Evaluate'
  | 'Create';

export interface Question {
  id: string;
  examType: ExamType;
  subject: Subject;
  topic: string;
  subTopic?: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string;
  correctOptionIndex?: number;
  explanation: string;
  difficulty: DifficultyLevel;
  marks: number;
  negativeMarks: number;
  bloomsLevel: BloomsLevel;
  estimatedTimeSeconds: number;
  source?: 'AI Generated' | 'Institute Faculty' | 'PYQ Archive';
  passage?: string;
}

export interface SectionBlueprint {
  id: string;
  name: string;
  subject: Subject;
  questions: Question[];
  totalQuestions: number;
  maxToAttempt?: number; // e.g. 10 questions, attempt any 5
  markingScheme: {
    correct: number;
    incorrect: number;
    unattempted: number;
    partialAllowed?: boolean;
  };
}

export interface TestBlueprint {
  id: string;
  title: string;
  examType: ExamType;
  targetBatchIds: string[];
  totalDurationMinutes: number;
  totalMarks: number;
  cutoffPercentage: number;
  status: 'Draft' | 'Scheduled' | 'Live' | 'Completed';
  createdDate: string;
  instructions: string[];
  sections: SectionBlueprint[];
  instituteBranding: {
    instituteName: string;
    branch: string;
    watermarkText: string;
    testCode: string;
  };
}

export interface Batch {
  id: string;
  name: string;
  targetExam: ExamType;
  targetYear: string;
  studentCount: number;
  facultyLead: string;
  timing: string;
  activeTestCount: number;
  avgAccuracy: number;
  averageScore: number;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  guardianName?: string;
  guardianPhone?: string;
  branchName?: string;
  batchId: string;
  batchName: string;
  targetExam: ExamType;
  attendanceRate: number;
  totalTestsAttempted: number;
  avgScore: number;
  rankInBatch: number;
  weakTopics: string[];
  strongTopics: string[];
  avatarUrl?: string;
  recentTeacherFeedback?: string;
}

export interface CampusBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  centerHead: string;
  totalStudents: number;
  activeBatches: number;
  overallAvgScore: number;
  cutoffClearanceRate: number;
  topScore: number;
  topPercentileCount: number;
  subjectAverages: {
    physics: number;
    chemistry: number;
    mathematics: number;
    biology?: number;
  };
  scoreDistribution: {
    topTier: number; // >80%
    proficient: number; // 60-80%
    average: number; // 40-60%
    needSupport: number; // <40%
  };
  attendanceRate: number;
  status: 'doing_good' | 'doing_not_good' | 'average';
  healthScore: number; // 0 - 100
  facultyCount: number;
  facultyHealthScore: number; // 0 - 100
  studentSatisfaction: number; // 0 - 100
  syllabusCompletion: number; // percentage
  statusReason?: string;
  openIssuesCount?: number;
}

export interface AdminIssue {
  id: string;
  centerId: string;
  centerName: string;
  level: 'faculty' | 'student';
  severity: 'critical' | 'warning' | 'moderate';
  title: string;
  description: string;
  affectedCount: number;
  reportedDate: string;
  status: 'open' | 'resolving' | 'resolved';
  suggestedFix: string;
  availableActions: string[];
  actionTaken?: string;
  resolvedAt?: string;
}

export interface OmrDetectedQuestion {
  questionNumber: number;
  markedOption: 'A' | 'B' | 'C' | 'D' | 'BLANK' | 'DOUBLE_MARKED';
  confidence: number; // e.g. 0.99
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  status: 'correct' | 'incorrect' | 'blank' | 'ambiguous';
  marksAwarded: number;
}

export interface OmrScanResult {
  scanId: string;
  studentRollNumber: string;
  studentName: string;
  testCode: string;
  testTitle: string;
  scannedTimestamp: string;
  confidenceScore: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  blankCount: number;
  ambiguousCount: number;
  totalMarksAwarded: number;
  maxMarks: number;
  percentage: number;
  questions: OmrDetectedQuestion[];
}

export interface QuestionAttemptState {
  questionId: string;
  userAnswer: string; // selected option index or string or text
  status: 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_and_marked';
  timeSpentSeconds: number;
  isCorrect?: boolean;
  marksAwarded?: number;
  aiEvaluation?: {
    awardedMarks: number;
    percentage: number;
    conceptUnderstanding: string;
    aiFeedback: string;
    strengths: string[];
    missedPoints: string[];
    improvementTip: string;
  };
}

export interface TestAttemptResult {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  batchName: string;
  submittedAt: string;
  totalMarksAwarded: number;
  maxMarks: number;
  percentage: number;
  accuracy: number;
  timeTakenSeconds: number;
  percentile: number;
  rank: number;
  totalParticipants: number;
  answers: Record<string, QuestionAttemptState>;
  sectionScores: Record<string, { scored: number; total: number; accuracy: number }>;
}

export interface RemedialPlan {
  diagnosticSummary: string;
  recommendedExamStrategy: string;
  weeklyPlan: Array<{
    day: string;
    focus: string;
    action: string;
    practiceTarget: string;
    keyTrapToAvoid: string;
  }>;
  expectedScoreJump: string;
}

export type UserRole = 'admin' | 'faculty' | 'student';

export interface InstituteSettings {
  instituteName: string;
  branch: string;
  tagline: string;
  themeColor: string;
  watermarkingEnabled: boolean;
  currentRole: UserRole;
  currentStudentId: string;
}
