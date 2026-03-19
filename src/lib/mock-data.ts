export interface Contractor {
  id: string;
  name: string;
  company: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  specialty: string;
  location: string;
  yearsExperience: number;
  jobsCompleted: number;
  hourlyRate: number;
  verified: boolean;
  licensed: boolean;
  insured: boolean;
  bio: string;
  skills: string[];
}

export interface Homeowner {
  id: string;
  name: string;
  avatar: string;
  location: string;
  memberSince: string;
  projectsPosted: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: { min: number; max: number };
  location: string;
  postedBy: string;
  postedDate: string;
  deadline: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  bidsCount: number;
  photos: number;
  urgency: "low" | "medium" | "high";
}

export interface Estimate {
  id: string;
  jobTitle: string;
  clientName: string;
  amount: number;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired";
  createdDate: string;
  sentDate: string | null;
  lineItems: { description: string; quantity: number; unitPrice: number }[];
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  text: string;
  date: string;
  role: "homeowner" | "contractor";
}

export interface Project {
  id: string;
  title: string;
  contractor: string;
  status: "pending" | "in_progress" | "completed";
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  estimatedEnd: string;
  milestones: { name: string; completed: boolean }[];
}

export const mockContractors: Contractor[] = [
  {
    id: "c1",
    name: "Marcus Johnson",
    company: "Johnson & Sons Construction",
    avatar: "",
    rating: 4.9,
    reviewCount: 127,
    specialty: "General Contracting",
    location: "Austin, TX",
    yearsExperience: 15,
    jobsCompleted: 342,
    hourlyRate: 85,
    verified: true,
    licensed: true,
    insured: true,
    bio: "Third-generation contractor specializing in residential remodels and new construction. Licensed and insured with a commitment to quality craftsmanship.",
    skills: ["Framing", "Finish Carpentry", "Project Management", "Concrete"],
  },
  {
    id: "c2",
    name: "Sarah Chen",
    company: "Precision Electric LLC",
    avatar: "",
    rating: 4.8,
    reviewCount: 89,
    specialty: "Electrical",
    location: "Dallas, TX",
    yearsExperience: 12,
    jobsCompleted: 256,
    hourlyRate: 95,
    verified: true,
    licensed: true,
    insured: true,
    bio: "Master electrician with expertise in residential and light commercial work. Specializing in panel upgrades, EV charger installations, and smart home wiring.",
    skills: ["Panel Upgrades", "EV Chargers", "Smart Home", "Troubleshooting"],
  },
  {
    id: "c3",
    name: "Robert Garcia",
    company: "Garcia Plumbing Services",
    avatar: "",
    rating: 4.7,
    reviewCount: 203,
    specialty: "Plumbing",
    location: "San Antonio, TX",
    yearsExperience: 20,
    jobsCompleted: 512,
    hourlyRate: 90,
    verified: true,
    licensed: true,
    insured: true,
    bio: "Licensed master plumber serving the San Antonio area for over 20 years. From pipe repairs to full bathroom remodels, we do it right the first time.",
    skills: ["Pipe Repair", "Bathroom Remodels", "Water Heaters", "Sewer Lines"],
  },
  {
    id: "c4",
    name: "James Mitchell",
    company: "Mitchell Roofing Co.",
    avatar: "",
    rating: 4.9,
    reviewCount: 156,
    specialty: "Roofing",
    location: "Houston, TX",
    yearsExperience: 18,
    jobsCompleted: 428,
    hourlyRate: 75,
    verified: true,
    licensed: true,
    insured: true,
    bio: "Full-service roofing contractor specializing in storm damage repair, metal roofing, and complete roof replacements. Hail damage experts.",
    skills: ["Metal Roofing", "Shingle Replacement", "Storm Damage", "Inspections"],
  },
  {
    id: "c5",
    name: "Lisa Thompson",
    company: "Thompson Painting & Finishes",
    avatar: "",
    rating: 4.6,
    reviewCount: 74,
    specialty: "Painting",
    location: "Fort Worth, TX",
    yearsExperience: 8,
    jobsCompleted: 189,
    hourlyRate: 65,
    verified: true,
    licensed: true,
    insured: true,
    bio: "Interior and exterior painting with an eye for detail. We use premium materials and take pride in clean, lasting finishes.",
    skills: ["Interior Painting", "Exterior Painting", "Cabinet Refinishing", "Staining"],
  },
  {
    id: "c6",
    name: "Derek Williams",
    company: "DW Flooring Solutions",
    avatar: "",
    rating: 4.8,
    reviewCount: 112,
    specialty: "Flooring",
    location: "Austin, TX",
    yearsExperience: 10,
    jobsCompleted: 298,
    hourlyRate: 70,
    verified: true,
    licensed: true,
    insured: false,
    bio: "Hardwood, tile, LVP, and carpet installation. We handle everything from demo to final trim. Showroom available by appointment.",
    skills: ["Hardwood", "Tile", "LVP", "Carpet"],
  },
];

export const mockJobs: Job[] = [
  {
    id: "j1",
    title: "Kitchen Remodel - Full Gut",
    description:
      "Complete kitchen remodel including demo, new cabinets, countertops, backsplash, and appliance installation. Approximately 200 sq ft.",
    category: "Remodeling",
    budget: { min: 25000, max: 45000 },
    location: "Austin, TX",
    postedBy: "Michael Brown",
    postedDate: "2026-03-15",
    deadline: "2026-04-30",
    status: "open",
    bidsCount: 4,
    photos: 6,
    urgency: "medium",
  },
  {
    id: "j2",
    title: "Electrical Panel Upgrade - 200A",
    description:
      "Upgrade existing 100A panel to 200A service. Need to support EV charger and future solar installation. Permits required.",
    category: "Electrical",
    budget: { min: 2500, max: 4000 },
    location: "Dallas, TX",
    postedBy: "Jennifer Wilson",
    postedDate: "2026-03-17",
    deadline: "2026-04-15",
    status: "open",
    bidsCount: 7,
    photos: 3,
    urgency: "high",
  },
  {
    id: "j3",
    title: "Master Bathroom Plumbing Rough-In",
    description:
      "New master bathroom addition. Need complete plumbing rough-in for double vanity, walk-in shower, and freestanding tub.",
    category: "Plumbing",
    budget: { min: 5000, max: 8000 },
    location: "San Antonio, TX",
    postedBy: "David Anderson",
    postedDate: "2026-03-10",
    deadline: "2026-05-01",
    status: "open",
    bidsCount: 3,
    photos: 4,
    urgency: "low",
  },
  {
    id: "j4",
    title: "Roof Replacement After Hail Damage",
    description:
      "Insurance claim approved for full roof replacement. 2,800 sq ft single-story ranch. Architectural shingles preferred.",
    category: "Roofing",
    budget: { min: 8000, max: 14000 },
    location: "Houston, TX",
    postedBy: "Patricia Taylor",
    postedDate: "2026-03-18",
    deadline: "2026-04-10",
    status: "open",
    bidsCount: 12,
    photos: 8,
    urgency: "high",
  },
  {
    id: "j5",
    title: "Interior Painting - 4 Bedroom House",
    description:
      "Full interior repaint. 4 bedrooms, 2 bathrooms, living room, dining room, and hallways. Walls and ceilings. We'll provide paint.",
    category: "Painting",
    budget: { min: 3000, max: 5500 },
    location: "Fort Worth, TX",
    postedBy: "Amanda Clark",
    postedDate: "2026-03-16",
    deadline: "2026-04-20",
    status: "open",
    bidsCount: 6,
    photos: 5,
    urgency: "medium",
  },
  {
    id: "j6",
    title: "Hardwood Floor Installation - 1200 sq ft",
    description:
      "Install engineered hardwood throughout main living areas. Remove existing carpet. Includes transitions and quarter round.",
    category: "Flooring",
    budget: { min: 6000, max: 10000 },
    location: "Austin, TX",
    postedBy: "Thomas Harris",
    postedDate: "2026-03-14",
    deadline: "2026-04-25",
    status: "in_progress",
    bidsCount: 5,
    photos: 3,
    urgency: "low",
  },
];

export const mockEstimates: Estimate[] = [
  {
    id: "e1",
    jobTitle: "Kitchen Remodel - Full Gut",
    clientName: "Michael Brown",
    amount: 38500,
    status: "sent",
    createdDate: "2026-03-16",
    sentDate: "2026-03-16",
    lineItems: [
      { description: "Demo & Disposal", quantity: 1, unitPrice: 3500 },
      { description: "Cabinets (Custom)", quantity: 1, unitPrice: 12000 },
      { description: "Countertops (Quartz)", quantity: 42, unitPrice: 85 },
      { description: "Backsplash Tile", quantity: 30, unitPrice: 45 },
      { description: "Plumbing Rough-In", quantity: 1, unitPrice: 2800 },
      { description: "Electrical Work", quantity: 1, unitPrice: 2200 },
      { description: "Flooring (Tile)", quantity: 200, unitPrice: 12 },
      { description: "Labor", quantity: 120, unitPrice: 85 },
    ],
  },
  {
    id: "e2",
    jobTitle: "Bathroom Renovation",
    clientName: "Sarah Williams",
    amount: 15200,
    status: "accepted",
    createdDate: "2026-03-10",
    sentDate: "2026-03-10",
    lineItems: [
      { description: "Demo", quantity: 1, unitPrice: 1500 },
      { description: "Tile (Floor & Shower)", quantity: 1, unitPrice: 4200 },
      { description: "Vanity & Fixtures", quantity: 1, unitPrice: 3500 },
      { description: "Plumbing", quantity: 1, unitPrice: 2800 },
      { description: "Labor", quantity: 40, unitPrice: 80 },
    ],
  },
  {
    id: "e3",
    jobTitle: "Deck Build - 400 sq ft",
    clientName: "Robert Davis",
    amount: 22000,
    status: "viewed",
    createdDate: "2026-03-14",
    sentDate: "2026-03-14",
    lineItems: [
      { description: "Composite Decking Material", quantity: 400, unitPrice: 22 },
      { description: "Framing Lumber", quantity: 1, unitPrice: 3200 },
      { description: "Concrete Footings", quantity: 8, unitPrice: 175 },
      { description: "Railing System", quantity: 60, unitPrice: 35 },
      { description: "Labor", quantity: 80, unitPrice: 85 },
    ],
  },
  {
    id: "e4",
    jobTitle: "HVAC System Replacement",
    clientName: "Emily Johnson",
    amount: 8900,
    status: "draft",
    createdDate: "2026-03-18",
    sentDate: null,
    lineItems: [
      { description: "3-Ton AC Unit", quantity: 1, unitPrice: 3800 },
      { description: "Furnace", quantity: 1, unitPrice: 2200 },
      { description: "Ductwork Modifications", quantity: 1, unitPrice: 800 },
      { description: "Thermostat (Smart)", quantity: 1, unitPrice: 250 },
      { description: "Labor & Installation", quantity: 1, unitPrice: 1850 },
    ],
  },
  {
    id: "e5",
    jobTitle: "Fence Installation - 150 LF",
    clientName: "Chris Martinez",
    amount: 6750,
    status: "declined",
    createdDate: "2026-03-08",
    sentDate: "2026-03-09",
    lineItems: [
      { description: "Cedar Pickets (6ft)", quantity: 300, unitPrice: 8 },
      { description: "Posts & Rails", quantity: 1, unitPrice: 1800 },
      { description: "Concrete (Post Set)", quantity: 25, unitPrice: 18 },
      { description: "Hardware", quantity: 1, unitPrice: 350 },
      { description: "Labor", quantity: 24, unitPrice: 75 },
    ],
  },
];

export const mockReviews: Review[] = [
  {
    id: "r1",
    authorName: "Michael Brown",
    authorAvatar: "",
    rating: 5,
    text: "FairTradeWorker made finding a contractor for our kitchen remodel incredibly simple. We got multiple bids within 24 hours and the contractor we chose did exceptional work.",
    date: "2026-03-01",
    role: "homeowner",
  },
  {
    id: "r2",
    authorName: "Marcus Johnson",
    authorAvatar: "",
    rating: 5,
    text: "As a contractor, this platform is a game-changer. No lead fees, quality homeowners, and the Voice AI estimator saves me hours every week. I've grown my business 40% since joining.",
    date: "2026-02-15",
    role: "contractor",
  },
  {
    id: "r3",
    authorName: "Jennifer Wilson",
    authorAvatar: "",
    rating: 5,
    text: "I was tired of getting ghosted by contractors and dealing with unreliable quotes. FairTradeWorker matched me with three verified electricians and I had my panel upgraded within a week.",
    date: "2026-02-28",
    role: "homeowner",
  },
  {
    id: "r4",
    authorName: "Sarah Chen",
    authorAvatar: "",
    rating: 4,
    text: "The escrow payment system gives my clients confidence and ensures I get paid on time. The platform respects both sides of the transaction. Highly recommend for any trade professional.",
    date: "2026-01-20",
    role: "contractor",
  },
  {
    id: "r5",
    authorName: "David Anderson",
    authorAvatar: "",
    rating: 5,
    text: "Transparent pricing, no hidden fees, and contractors who actually show up. This is what the home services industry has needed for years.",
    date: "2026-03-10",
    role: "homeowner",
  },
];

export const mockProjects: Project[] = [
  {
    id: "p1",
    title: "Kitchen Remodel",
    contractor: "Johnson & Sons Construction",
    status: "in_progress",
    progress: 65,
    budget: 38500,
    spent: 25000,
    startDate: "2026-02-15",
    estimatedEnd: "2026-04-15",
    milestones: [
      { name: "Demo Complete", completed: true },
      { name: "Rough-In Inspected", completed: true },
      { name: "Cabinets Installed", completed: true },
      { name: "Countertops Installed", completed: false },
      { name: "Final Walkthrough", completed: false },
    ],
  },
  {
    id: "p2",
    title: "Bathroom Renovation",
    contractor: "Garcia Plumbing Services",
    status: "in_progress",
    progress: 30,
    budget: 15200,
    spent: 4500,
    startDate: "2026-03-01",
    estimatedEnd: "2026-04-01",
    milestones: [
      { name: "Demo Complete", completed: true },
      { name: "Plumbing Rough-In", completed: false },
      { name: "Tile Installation", completed: false },
      { name: "Fixtures & Trim", completed: false },
    ],
  },
  {
    id: "p3",
    title: "Interior Painting",
    contractor: "Thompson Painting & Finishes",
    status: "completed",
    progress: 100,
    budget: 4200,
    spent: 4200,
    startDate: "2026-01-10",
    estimatedEnd: "2026-01-20",
    milestones: [
      { name: "Prep & Priming", completed: true },
      { name: "First Coat", completed: true },
      { name: "Second Coat", completed: true },
      { name: "Touch-ups & Cleanup", completed: true },
    ],
  },
];

export const mockHomeowners: Homeowner[] = [
  {
    id: "h1",
    name: "Michael Brown",
    avatar: "",
    location: "Austin, TX",
    memberSince: "2025-06-15",
    projectsPosted: 3,
  },
  {
    id: "h2",
    name: "Jennifer Wilson",
    avatar: "",
    location: "Dallas, TX",
    memberSince: "2025-09-01",
    projectsPosted: 1,
  },
  {
    id: "h3",
    name: "David Anderson",
    avatar: "",
    location: "San Antonio, TX",
    memberSince: "2025-11-20",
    projectsPosted: 2,
  },
];

export const contractorDashboardStats = {
  estimatesSent: 23,
  estimatesAccepted: 18,
  activeJobs: 4,
  monthlyRevenue: 48500,
  revenueChange: 12.5,
  avgRating: 4.9,
  responseTime: "2.4 hrs",
};

export const homeownerDashboardStats = {
  activeProjects: 2,
  pendingEstimates: 3,
  totalSpent: 29500,
  savedVsAverage: 4200,
};
