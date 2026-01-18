
export enum UserRole {
  HOMEOWNER = 'HOMEOWNER',
  CONTRACTOR = 'CONTRACTOR',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  CREW_MEMBER = 'CREW_MEMBER',
  FRANCHISE_OWNER = 'FRANCHISE_OWNER',
  ADMIN = 'ADMIN'
}

export type UserTier = 'FREE' | 'STARTER' | 'PRO' | 'ELITE' | 'ENTERPRISE';

export interface UserPreferences {
  aiPersonality: 'PROFESSIONAL' | 'FRIENDLY' | 'MINIMAL';
  verbosity: 'CONCISE' | 'DETAILED';
  theme: 'SYSTEM' | 'DARK' | 'LIGHT';
}

export interface BusinessVerification {
  businessName: string;
  ein: string;
  licenseNumber: string;
  licenseState: string;
  insuranceProvider: string;
  policyNumber: string;
  policyExpiration: string;
  isVerified: boolean;
  verificationDate?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tier: UserTier;
  preferences: UserPreferences;
  tradeTypes?: string[];
  avgResponseTime?: string;
  reputationScore?: number;
  businessProfile?: BusinessVerification;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tier: UserTier;
  preferences: UserPreferences;
  avatar?: string;
  phone?: string;
  createdAt?: string;
}

export interface Bid {
  id: string;
  jobId: string;
  contractorId: string;
  contractorName: string;
  amount: number;
  timeline: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  coverLetter?: string;
  contractorRating?: number;
}

export interface Dispute {
  id: string;
  contractId: string;
  completionId?: string;
  homeownerId: string;
  contractorId: string;
  initiatedBy: 'HOMEOWNER' | 'CONTRACTOR';
  reason: string;
  status: 'OPEN' | 'MEDIATION' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  resolutionPath?: 'REFUND' | 'REWORK' | 'PARTIAL_REFUND' | 'ARBITRATION';
  contractorResponse?: string;
  adminNotes?: string;
  evidence?: string[];
}

export interface LeadScore {
  total: number;
  commitment: number;
  urgency: number;
  budgetFit: number;
  rationale: string;
}

export type View = 
  | 'LANDING'
  | 'DASHBOARD' | 'MARKETPLACE' | 'POST_JOB' | 'SETTINGS' | 'PROFILE' 
  | 'CRM' | 'WALLET' | 'PRICING' | 'OPERATIONS' | 'TERRITORY_MAP' | 'FRANCHISE_MGMT' | 'ADMIN_PANEL'
  | 'ESTIMATES' | 'AI_RECEPTIONIST' | 'VOICE_COMMAND' | 'CREW_MGMT'
  | 'LEGAL_TERMS' | 'LEGAL_PRIVACY' | 'SUPPORT_HELP' | 'SAFETY_GUIDELINES';

// --- NEW THEME TYPES ---
export type ThemeColor = 'blue' | 'emerald' | 'violet' | 'orange' | 'crimson' | 'industrial' | 'slate' | 'teal' | 'cozy' | 'luxury' | 'neon' | 'hacker';
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type InterfaceDensity = 'comfortable' | 'compact';
export type AppFont = 'sans' | 'mono';
export type FontSize = 'sm' | 'md' | 'lg';
export type ContrastMode = 'standard' | 'high';
export type BackgroundPattern = 'none' | 'grid' | 'dots' | 'noise' | 'camo-forest' | 'camo-desert' | 'camo-urban' | 'camo-midnight' | 'camo-digital' | 'blueprint' | 'paper' | 'circuit' | 'topography' | 'hex' | 'graph';

export interface ThemeSettings {
  color: ThemeColor;
  radius: BorderRadius;
  density: InterfaceDensity;
  font: AppFont;
  fontSize: FontSize;
  contrast: ContrastMode;
  darkMode?: boolean;
  glassStrength?: 'low' | 'medium' | 'high' | 'opaque';
  texture: BackgroundPattern;
  animationSpeed?: 'instant' | 'fast' | 'normal' | 'slow';
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}

export interface NavItemConfig {
  id: View;
  label: string;
  visible: boolean;
  required?: boolean; 
  tierGated?: UserTier;
}
// -----------------------

export interface CallLog {
  id: string;
  customerName: string;
  phoneNumber: string;
  duration: string;
  timestamp: string;
  summary: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  status: 'QUALIFIED' | 'BOOKED' | 'MESSAGE_LEFT';
  transcript?: string;
}

export type TerritoryTier = 'RURAL' | 'SUBURBAN' | 'URBAN' | 'METRO_CORE';

export interface Territory {
  id: string;
  fipsCode: string;
  zipCodes: string[];
  name: string;
  tier: TerritoryTier;
  status: 'AVAILABLE' | 'CLAIMED' | 'RESERVED' | 'CONTESTED';
  pricing: TerritoryPricing;
  geometry?: any; 
  x: number;
  y: number;
  state: string;
}

export interface TerritoryPricing {
  baseRate: number;
  densityModifier: number;
  demandIndex: number;
  currentPrice: {
    exclusive: number;
    preferred: number;
    standard: number;
  };
}

export enum JobStatus {
  DRAFT = 'Draft',
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  PAID = 'Paid',
  DISPUTED = 'Disputed'
}

export type JobStage = 'POSTED' | 'BIDDING' | 'SCHEDULED' | 'WORKING' | 'REVIEW' | 'COMPLETE';

export type ServiceCategory = 'Plumbing' | 'Electrical' | 'Carpentry' | 'HVAC' | 'Painting' | 'Appliances' | 'Roofing' | 'Other';

export interface Job {
  id: string;
  title: string;
  category?: ServiceCategory;
  subcategory?: string;
  description: string;
  location: string;
  propertyType?: 'House' | 'Condo' | 'Apartment' | 'Commercial';
  timing?: 'Immediately' | 'Flexible' | 'Future';
  coordinates?: any;
  budgetRange: string;
  status: JobStatus;
  stage?: JobStage; // For tracking progress bar
  images: string[];
  videos?: string[];
  postedDate: string;
  bidCount?: number;
  isUrgent?: boolean;
  boostFee?: number;
  aiAnalysis?: {
    complexityScore?: number;
    estimatedDuration?: string;
    riskFactors?: string[];
    materialsList?: string[];
  };
  scopeOfWork?: string[];
  materialsList?: string[];
  assignedCrew?: string;
}

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Estimate {
  id: string;
  clientName: string;
  projectName: string;
  date: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'INVOICED';
  items: EstimateItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'IN_STOCK' | 'LOW' | 'OUT';
}

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  date: string;
  type: 'JOB' | 'ESTIMATE' | 'TASK' | 'PERSONAL';
  location: string;
  crewAssigned?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'DONE';
}

export interface Lead {
  id: string;
  customerName: string;
  service: string;
  status: 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | 'ARCHIVED';
  value: number;
  date: string;
  source: 'ONLINE' | 'REFERRAL' | 'MANUAL_IMPORT';
  isPlatformInvited?: boolean;
}

export interface Transaction {
  id: string;
  type: 'PAYMENT' | 'PAYOUT' | 'FEE' | 'REFUND';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  date: string;
  description: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'IDLE' | 'BREAK' | 'OFFLINE';
  currentLocation: string;
  lastActive: string;
  batteryLevel: number;
  currentJobId?: string;
  avatar: string;
  weeklyHours: number;
  phone?: string;
  email?: string;
  skills?: string[];
}

export interface TimeSheetEntry {
  id: string;
  crewId: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  totalHours: number;
  jobId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// ============================================
// CRITICAL: BID CONTRACT & MARKETPLACE SYSTEM
// ============================================

export interface MilestonePayment {
  id: string;
  description: string;
  amount: number;
  percentage: number; // % of total
  dueDate?: string;
  completionRequired?: string[]; // ['PHOTOS', 'SIGNATURE', 'VIDEO']
  status: 'PENDING' | 'APPROVED' | 'PAID';
  approvedBy?: string;
  approvedAt?: string;
  evidenceSubmittedAt?: string;
}

export interface BidContract {
  id: string;
  jobId: string;
  contractorId: string;
  contractorName: string;
  homeownerId: string;

  // Contract Terms
  bidAmount: number;
  scopeOfWork: string[];
  materialsList: EstimateItem[];
  startDate: string;
  estimatedDuration: string;
  estimatedEndDate?: string;

  // Payment Structure
  paymentTerms: {
    totalAmount: number;
    deposit: number;
    depositPercentage: number;
    milestone1?: MilestonePayment;
    milestone2?: MilestonePayment;
    finalPayment: number;
    finalPaymentPercentage: number;
  };

  // Completion & Verification
  completionEvidenceRequired: 'PHOTOS' | 'PHOTOS_SIGNATURE' | 'VIDEO_WALKTHROUGH' | 'INSPECTOR_APPROVAL';
  photosRequired?: number;
  allowDisputeWindow: boolean;
  disputeWindowDays: number; // Default 5 days after completion

  // Contractual Status
  status: 'DRAFT' | 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancellationReason?: string;

  // Bid Transparency
  bidVisibilityHidden: boolean; // For blind bidding
  competitorBidCount?: number; // Show count but hide amounts

  // Dispute Tracking
  disputeStatus?: 'NONE' | 'PENDING' | 'MEDIATION' | 'ESCALATED' | 'RESOLVED';
  disputeInitiatedBy?: 'HOMEOWNER' | 'CONTRACTOR';
  disputeReason?: string;
  disputeStartedAt?: string;
  resolutionPath?: 'REFUND' | 'REWORK' | 'PARTIAL_REFUND' | 'ARBITRATION';

  // Insurance & Compliance
  insuranceVerified: boolean;
  licenseVerified: boolean;
  backgroundCheckPassed: boolean;

  // Notes & Communication
  contractorNotes?: string;
  homeownerNotes?: string;
  changes?: ContractChange[];
}

export interface ContractChange {
  id: string;
  description: string;
  type: 'SCOPE_CHANGE' | 'TIME_EXTENSION' | 'PRICE_ADJUSTMENT';
  proposedBy: 'CONTRACTOR' | 'HOMEOWNER';
  proposedAmount?: number;
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  respondedAt?: string;
}

export interface BidAnalytics {
  jobId: string;
  bidCount: number;
  avgBidAmount: number;
  highestBid: number;
  lowestBid: number;
  timeToClose?: string;
  winningBidAmount?: number;
  winningContractorId?: string;
  contractorBidResponseTimes: { contractorId: string; responseTimeMinutes: number }[];
  bidWinRate?: number; // 0-100
  conversionRate?: number; // bids to jobs completed
}

export interface JobCompletion {
  id: string;
  contractId: string;
  jobId: string;
  submittedBy: 'CONTRACTOR' | 'HOMEOWNER';
  submittedAt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DISPUTED';

  // Evidence
  photoUrls: string[];
  videoUrl?: string;
  signatureUrl?: string; // Homeowner signature of approval
  locationGeohash?: string;
  timestampSubmitted: string;

  // Homeowner Approval
  approvedAt?: string;
  approvalNotes?: string;
  homeownerSatisfaction?: number; // 1-5 stars

  // Rejection/Dispute
  rejectionReason?: string;
  rejectionNotes?: string;
  photosRequired?: string[]; // What homeowner wants to see

  // Dispute Window
  disputeWindowExpiresAt: string;
  disputeInitiatedAt?: string;
  disputeNotes?: string;
  resolutionPath?: string;

  // Payout Status
  payoutStatus: 'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED' | 'REFUNDED' | 'PARTIAL_REFUND';
  payoutAmount?: number;
  payoutReleasedAt?: string;
}
