export type UserRole = 'faculty' | 'pr_lead' | 'senior_manager';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type StoryStatus = 'New' | 'Reviewing' | 'Pitched' | 'Placed' | 'Declined' | 'Archived';

export interface Story {
  id: string;
  overview: string;
  summary: string;
  department: string;
  category: string;
  status: StoryStatus;

  submitter_id: string;
  submitter_name: string;
  submitter_email: string;

  subjects: string[];

  under_18: 'Yes' | 'No' | 'Unsure';
  student_contact: string;

  priority_score: number;
  ratings: {
    news?: number;
    timely?: number;
    human?: number;
  };

  placement_notes: string;
  internal_notes: string;

  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  story_id: string;
  file_url: string;
  file_name: string;
  file_type: 'image' | 'document' | 'video';
  file_size: number;
  created_at: string;
}

export interface StoryEvent {
  id: string;
  story_id: string;
  event_type: 'created' | 'status_changed' | 'scored' | 'noted';
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface ScoringConfig {
  id: string;
  weights: {
    news: number;
    timely: number;
    balance: number;
    human: number;
  };
  factors: {
    [key: string]: {
      label: string;
      opts: Array<{ label: string; value: number }>;
    };
  };
  quiet_days: number;
  stale_days: number;
  created_at: string;
  updated_at: string;
}
