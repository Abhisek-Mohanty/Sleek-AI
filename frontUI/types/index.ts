export type LeadSource =
  | "Website"
  | "LinkedIn"
  | "Referral"
  | "Inbound Call"
  | "Google Ads"
  | "Partner"
  | "Exhibition"
  | "Direct";

export type EnquiryStatus =
  | "New"
  | "Contacted"
  | "In Progress"
  | "Qualified"
  | "Proposal"
  | "Converted"
  | "Lost";

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
  sourceType?: LeadSource | string;
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
