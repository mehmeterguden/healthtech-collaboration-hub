export type UserRole = "engineer" | "healthcare" | "admin";

export type PostStatus = "draft" | "active" | "meeting_scheduled" | "partner_found" | "expired";

export type ProjectStage = "idea" | "concept_validation" | "prototype" | "pilot_testing" | "pre_deployment";

export type CollaborationType = "advisor" | "co_founder" | "research_partner";

export type ConfidentialityLevel = "public" | "meeting_only";

export type MeetingStatus = "pending" | "accepted" | "declined" | "scheduled" | "completed" | "cancelled";

export type CommitmentLevel = "low" | "medium" | "high" | "full_time";

export interface User {
  id: string;
  slug: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institution: string;
  city: string;
  country: string;
  expertise: string[];
  bio: string;
  avatarUrl: string;
  profileCompleteness: number;
  createdAt: string;
  isActive: boolean;
  lastLogin: string;
  postCount: number;
  meetingCount: number;
  matchRate: number;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  title: string;
  domain: string;
  description: string;
  requiredExpertise: string[];
  projectStage: ProjectStage;
  commitmentLevel: CommitmentLevel;
  collaborationType: CollaborationType;
  confidentialityLevel: ConfidentialityLevel;
  city: string;
  country: string;
  status: PostStatus;
  expiryDate: string;
  autoClose: boolean;
  createdAt: string;
  updatedAt: string;
  interestCount: number;
  highLevelIdea?: string;
}

export interface Interest {
  id: string;
  postId: string;
  userId: string;
  user: User;
  message: string;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface MeetingRequest {
  id: string;
  postId: string;
  post: Post;
  requesterId: string;
  requester: User;
  receiverId: string;
  receiver: User;
  message: string;
  proposedSlots: TimeSlot[];
  selectedSlot?: TimeSlot;
  status: MeetingStatus;
  ndaAccepted: boolean;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionType: string;
  targetEntity: string;
  targetId: string;
  resultStatus: "success" | "failure";
  timestamp: string;
  ipAddress?: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalPosts: number;
  activePosts: number;
  totalMeetings: number;
  matchRate: number;
  weeklyRegistrations: { week: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
  domainDistribution: { domain: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
}

export interface DashboardStats {
  activePosts: number;
  pendingMeetings: number;
  totalMatches: number;
  profileViews: number;
}

export interface Notification {
  id: string;
  type: "interest" | "meeting_request" | "meeting_accepted" | "meeting_declined" | "partner_found";
  message: string;
  read: boolean;
  createdAt: string;
  linkTo: string;
}
