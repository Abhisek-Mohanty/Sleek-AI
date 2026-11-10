export type LeadSource =
  | "Website"
  | "LinkedIn"
  | "Referral"
  | "Inbound Call"
  | "Google Ads"
  | "Partner"
  | "Exhibition"
  | "Direct";

export const SOURCE_TYPE_OPTIONS: Record<number | string, any> = {
  1: "Website",
  2: "LinkedIn",
  3: "Referral",
  4: "Inbound Call",
  5: "Google Ads",
  6: "Partner",
  7: "Exhibition",
  8: "Direct",
};

export type EnquiryStatus =
  | "New"
  | "Contacted"
  | "In Progress"
  | "Qualified"
  | "Proposal"
  | "Converted"
  | "Lost";

export const STATUS_OPTIONS: Record<number | string, any> = {
  1: "New",
  2: "Contacted",
  3: "In Progress",
  4: "Qualified",
  5: "Proposal",
  6: "Converted",
  7: "Lost",
};

export interface RawBackendEnquiry {
  firstName?: string;
  lastName?: string;
  sourceType?: number | string;
  status?: number | string;
  email?: string;
  mobile?: string;
}

export type PriorityLevel = "High" | "Medium" | "Low";

export interface EnquiryNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface ActivityHistoryItem {
  id: string;
  enquiryId: string;
  title: string;
  description: string;
  type: "created" | "stage_change" | "call" | "email" | "meeting" | "note" | "ai_insight";
  timestamp: string;
  actor: string;
}

export interface Enquiry {
  id: string;
  enquiryNumber?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  mobile: string;
  email: string;
  city?: string;
  company?: string;
  source: LeadSource;
  sourceType?: LeadSource | string | number;
  dateCreated: string;
  assignedRepId: string;
  assignedRepName: string;
  currentFunnelId?: string;
  currentStageId: string;
  currentStageName: string;
  status: EnquiryStatus;
  priority: PriorityLevel;
  lastContactedDate: string;
  nextFollowUpDate: string;
  leadScore: number;
  estimatedValue: number;
  tags: string[];
  notes: EnquiryNote[];
  aiSummary: string;
  aiRecommendedAction: string;
  daysInStage: number;
  activitiesCount: number;
}

export interface FunnelStage {
  id: string;
  name: string;
  order: number;
  purpose: string;
  requiredActions: string[];
  assignedRole: string;
  communicationChannel: "Email" | "Call" | "Meeting" | "WhatsApp" | "Multi-Channel";
  expectedDurationDays: number;
  entryCriteria: string;
  completionCriteria: string;
  successMetric: string;
  color: string;
}

export interface SalesFunnel {
  id: string;
  name: string;
  objective: string;
  productService: string;
  targetAudience: string;
  targetConversionGoal: number; // percentage
  expectedDuration: string;
  preferredChannels: string[];
  customInstructions?: string;
  stages: FunnelStage[];
  status: "draft" | "active" | "paused" | "archived";
  enquiriesCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ExecutionStepStatus =
  | "not_started"
  | "in_progress"
  | "waiting"
  | "completed"
  | "skipped"
  | "failed";

export interface SimulatedMessage {
  id: string;
  channel: "email" | "sms" | "whatsapp" | "call_script";
  subject?: string;
  content: string;
  aiGenerated: boolean;
  status: "draft" | "simulated_sent";
  sentAt?: string;
}

export interface StageExecution {
  stageId: string;
  status: ExecutionStepStatus;
  completedActions: string[];
  notes: string;
  completedAt?: string;
  simulatedMessages: SimulatedMessage[];
}

export interface FunnelExecution {
  enquiryId: string;
  funnelId: string;
  currentStageId: string;
  status: ExecutionStepStatus;
  isPaused: boolean;
  stageExecutions: Record<string, StageExecution>;
  startedAt: string;
  lastUpdatedAt: string;
}

export type ActivityType = "call" | "email" | "meeting" | "follow_up" | "task";
export type ActivityStatus = "pending" | "completed" | "overdue" | "cancelled";

export interface Activity {
  id: string;
  enquiryId: string;
  enquiryName: string;
  title: string;
  type: ActivityType;
  dueDate: string;
  dueTime?: string;
  assignedRepId: string;
  assignedRepName: string;
  priority: PriorityLevel;
  status: ActivityStatus;
  notes?: string;
  completedAt?: string;
}

export interface SalesRepresentative {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  activeLeads: number;
  conversions: number;
  conversionRate: number;
}

export interface WorkspaceSettings {
  workspaceName: string;
  companyName: string;
  currency: string;
  timezone: string;
  defaultFollowUpDays: number;
  stalledLeadDaysThreshold: number;
  autoAiScoringEnabled: boolean;
  notificationPreferences: {
    overdueAlerts: boolean;
    stageMoveAlerts: boolean;
    aiRecommendations: boolean;
    dailyDigest: boolean;
  };
  sources: string[];
  activityTypes: string[];
}
