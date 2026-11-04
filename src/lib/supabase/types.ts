// Hand-written DB types mirroring supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once the CLI is linked.

export type UserRole = "student" | "admin";
export type ContentStatus = "draft" | "published";
export type LessonType = "article" | "video" | "pdf" | "quiz";
export type EntitlementStatus = "pending" | "granted" | "revoked";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  position: number;
  created_at: string;
}

export interface Level {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  created_at: string;
}

export interface Course {
  id: string;
  level_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  is_premium: boolean;
  price: number | null;
  status: ContentStatus;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  type: LessonType;
  content: string | null;
  video_url: string | null;
  file_url: string | null;
  duration_min: number | null;
  is_premium: boolean;
  status: ContentStatus;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  pass_score: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  prompt: string;
  explanation: string | null;
  position: number;
}

export interface QuizOption {
  id: string;
  question_id: string;
  label: string;
  is_correct: boolean;
  position: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  last_viewed: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  created_at: string;
}

export interface Entitlement {
  id: string;
  user_id: string;
  course_id: string;
  status: EntitlementStatus;
  note: string | null;
  granted_by: string | null;
  granted_at: string | null;
  created_at: string;
}

export interface PageView {
  id: number;
  path: string;
  course_id: string | null;
  lesson_id: string | null;
  user_id: string | null;
  created_at: string;
}

// Minimal Database shape matching what @supabase/supabase-js expects so that
// .from()/.insert()/.update()/.rpc() infer real row types instead of `never`.
// NB: Insert/Update use explicit mapped types rather than Partial<T>; with a
// populated Functions map, Partial<T> defers evaluation and collapses the
// whole schema to `never`. The mapped form resolves eagerly.
type Table<T> = {
  Row: { [K in keyof T]: T[K] };
  Insert: { [K in keyof T]?: T[K] };
  Update: { [K in keyof T]?: T[K] };
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      categories: Table<Category>;
      levels: Table<Level>;
      courses: Table<Course>;
      lessons: Table<Lesson>;
      quizzes: Table<Quiz>;
      quiz_questions: Table<QuizQuestion>;
      quiz_options: Table<QuizOption>;
      enrollments: Table<Enrollment>;
      lesson_progress: Table<LessonProgress>;
      quiz_attempts: Table<QuizAttempt>;
      entitlements: Table<Entitlement>;
      page_views: Table<PageView>;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      has_course_access: { Args: { p_course_id: string }; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      content_status: ContentStatus;
      lesson_type: LessonType;
      entitlement_status: EntitlementStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
