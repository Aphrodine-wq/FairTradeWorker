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

export interface JobPhoto {
  url: string;
  caption: string;
  type: "photo" | "video";
}

export interface JobRequirement {
  label: string;
  met: boolean;
}

export interface PropertyDetails {
  stories: number;
  foundation: "slab" | "pier_beam" | "basement" | "crawlspace";
  exterior: string;
  roofType: string;
  roofAge: number;
  garage: "attached" | "detached" | "carport" | "none";
  lotSize: string;
  hoa: boolean;
  hoaNotes: string;
  heating: string;
  cooling: string;
  waterHeater: "gas" | "electric" | "tankless_gas" | "tankless_electric";
  plumbing: string;
  electrical: string;
  sewer: "city" | "septic";
  knownIssues: string[];
  recentWork: string[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  detailedScope: string;
  category: string;
  subcategory: string;
  budget: { min: number; max: number };
  location: string;
  fullAddress: string;
  postedBy: string;
  postedByRating: number;
  postedByJobs: number;
  postedByAvatar: string;
  postedDate: string;
  deadline: string;
  preferredStartDate: string;
  estimatedDuration: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  bidsCount: number;
  viewCount: number;
  photos: JobPhoto[];
  urgency: "low" | "medium" | "high";
  propertyType: "residential" | "commercial" | "industrial";
  sqft: number;
  yearBuilt: number;
  accessNotes: string;
  materialsProvided: boolean;
  permitsRequired: boolean;
  inspectionRequired: boolean;
  insuranceClaim: boolean;
  requirements: JobRequirement[];
  tags: string[];
  specialInstructions: string;
  thumbnail: string;
  property: PropertyDetails;
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

export interface FairRecord {
  id: string;
  publicId: string;
  projectId: string;
  contractorId: string;
  homeownerId: string;
  category: string;
  locationCity: string;
  scopeSummary: string;
  estimatedBudget: number;
  finalCost: number;
  budgetAccuracyPct: number;
  onBudget: boolean;
  estimatedEndDate: string;
  actualCompletionDate: string;
  onTime: boolean;
  qualityScoreAtCompletion: number;
  avgRating: number;
  reviewCount: number;
  disputeCount: number;
  photos: string[];
  homeownerConfirmed: boolean;
  confirmedAt: string | null;
  contractorName: string;
  contractorCompany: string;
  contractorRating: number;
  contractorJobsCompleted: number;
  projectTitle: string;
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
    title: "Kitchen Remodel - Full Gut & Rebuild",
    description:
      "Complete gut-and-rebuild kitchen remodel. Demo existing layout, install custom cabinets, quartz counters, tile backsplash, and all new appliances in a 220 sq ft galley-style kitchen.",
    detailedScope:
      "Phase 1 — Demo & Prep: Full demolition of existing cabinets, countertops, flooring, and soffit. Haul-away of all debris. Inspect and repair any subfloor damage found during demo.\n\nPhase 2 — Rough-In: Relocate gas line 4 ft to accommodate new island. Add dedicated 20A circuits for refrigerator, microwave, and dishwasher. Plumbing rough-in for relocated sink and dishwasher drain.\n\nPhase 3 — Install: Semi-custom shaker cabinets in Sherwin-Williams Alabaster, soft-close doors and drawers throughout. 3cm Calacatta Laza quartz countertops with full-height waterfall island. Subway tile backsplash in herringbone pattern. New LVP flooring to match adjacent dining room.\n\nPhase 4 — Finish: Install owner-supplied appliances (36\" range, 36\" refrigerator, dishwasher, microwave drawer). Under-cabinet LED lighting. Brushed nickel hardware throughout. Final punch list and cleanup.",
    category: "Remodeling",
    subcategory: "Kitchen",
    budget: { min: 25000, max: 45000 },
    location: "Austin, TX",
    fullAddress: "4821 Shoal Creek Blvd, Austin, TX 78756",
    postedBy: "Michael Brown",
    postedByRating: 4.8,
    postedByJobs: 3,
    postedByAvatar: "",
    postedDate: "2026-03-15",
    deadline: "2026-04-30",
    preferredStartDate: "2026-04-07",
    estimatedDuration: "4–6 weeks",
    status: "open",
    bidsCount: 4,
    viewCount: 89,
    thumbnail: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&h=300&fit=crop",
    photos: [
      { url: "https://picsum.photos/seed/ftw101/400/400", caption: "Existing kitchen — north wall cabinets", type: "photo" },
      { url: "https://picsum.photos/seed/ftw102/400/400", caption: "Existing kitchen — sink side and window", type: "photo" },
      { url: "https://picsum.photos/seed/ftw103/400/400", caption: "Current flooring condition", type: "photo" },
      { url: "https://picsum.photos/seed/ftw104/400/400", caption: "Soffit to be removed — opens to 9ft ceiling", type: "photo" },
      { url: "https://picsum.photos/seed/ftw105/400/400", caption: "Cabinet sample — shaker alabaster", type: "photo" },
      { url: "https://picsum.photos/seed/ftw106/400/400", caption: "Countertop slab selection — Calacatta Laza", type: "photo" },
    ],
    urgency: "medium",
    propertyType: "residential",
    sqft: 220,
    yearBuilt: 1998,
    accessNotes: "Owner is home during work hours. Key lockbox available for early access. Dogs on premises — please keep side gate latched.",
    materialsProvided: false,
    permitsRequired: true,
    inspectionRequired: true,
    insuranceClaim: false,
    requirements: [
      { label: "Texas General Contractor license required", met: false },
      { label: "Minimum 5 years kitchen remodel experience", met: false },
      { label: "Provide 3 comparable references with photos", met: false },
      { label: "Licensed plumber and electrician on team or subcontracted", met: false },
      { label: "Carry $1M general liability insurance", met: false },
    ],
    tags: ["kitchen", "remodel", "cabinets", "quartz", "tile", "plumbing", "electrical"],
    specialInstructions: "Homeowner has selected all finishes. Do not substitute materials without written approval. Protect adjacent hardwood floors with ram board during entire project. Pull all permits before any work begins.",
    property: {
      stories: 1, foundation: "slab", exterior: "Brick veneer / HardiPlank", roofType: "Composition shingle", roofAge: 8,
      garage: "attached", lotSize: "0.18 acres", hoa: true, hoaNotes: "Dumpster must be in driveway, not street. No work before 8am.",
      heating: "Gas forced air", cooling: "Central AC (3-ton)", waterHeater: "gas", plumbing: "Copper supply, PVC waste",
      electrical: "200A panel, copper wiring", sewer: "city",
      knownIssues: ["Garbage disposal leaks intermittently", "One GFCI outlet near sink is dead"],
      recentWork: ["Roof replaced 2018", "Water heater replaced 2022", "Exterior painted 2021"],
    },
  },
  {
    id: "j2",
    title: "Electrical Panel Upgrade + EV Charger Install",
    description:
      "Upgrade existing 100A main panel to 200A service. Add dedicated Level 2 EV charger circuit in garage. Must support planned solar installation.",
    detailedScope:
      "Scope of Work — Panel Upgrade: Replace existing Square D 100A main breaker panel with new 200A, 40-space panel. Upgrade meter base to support 200A service. Coordinate with Oncor for utility disconnect/reconnect. Install new grounding electrode system per NEC 2023.\n\nEV Charger Circuit: Run 60A, 240V dedicated circuit from new panel to garage — approximately 45 linear feet of conduit through attic space. Install flush-mount 14-50 outlet in garage wall for owner-supplied Level 2 charger. Label circuit clearly.\n\nSolar Pre-Wire: Install 60A breaker slot reserved for future solar inverter connection. Run empty 1\" conduit from panel to exterior south wall for future solar conduit entry point. Document all rough-in for solar installer.\n\nInspections: Pull City of Dallas permit. Schedule city inspection. Provide inspection report to homeowner.",
    category: "Electrical",
    subcategory: "Panel & Service",
    budget: { min: 3500, max: 6000 },
    location: "Dallas, TX",
    fullAddress: "7234 Lakewood Blvd, Dallas, TX 75214",
    postedBy: "Jennifer Wilson",
    postedByRating: 4.9,
    postedByJobs: 1,
    postedByAvatar: "",
    postedDate: "2026-03-17",
    deadline: "2026-04-15",
    preferredStartDate: "2026-03-28",
    estimatedDuration: "2–3 days",
    status: "open",
    bidsCount: 7,
    viewCount: 142,
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
    photos: [
      { url: "https://picsum.photos/seed/ftw107/400/400", caption: "Existing 100A panel — full", type: "photo" },
      { url: "https://picsum.photos/seed/ftw108/400/400", caption: "Meter base exterior", type: "photo" },
      { url: "https://picsum.photos/seed/ftw109/400/400", caption: "Garage wall — EV charger location", type: "photo" },
      { url: "https://picsum.photos/seed/ftw110/400/400", caption: "Attic space above panel — conduit route", type: "photo" },
    ],
    urgency: "high",
    propertyType: "residential",
    sqft: 2100,
    yearBuilt: 2004,
    accessNotes: "Owner works from home. Must call 30 min before arrival. Utility disconnect must be scheduled with Oncor at least 48 hours in advance.",
    materialsProvided: false,
    permitsRequired: true,
    inspectionRequired: true,
    insuranceClaim: false,
    requirements: [
      { label: "Texas Master Electrician license required", met: false },
      { label: "Oncor-approved contractor preferred", met: false },
      { label: "NEC 2023 code compliance mandatory", met: false },
      { label: "Carry $1M general liability + workers comp", met: false },
    ],
    tags: ["electrical", "panel-upgrade", "200A", "EV-charger", "solar-ready", "Dallas"],
    specialInstructions: "Owner has a Tesla Model Y — confirm charger circuit is compatible before installation. All work must pass city inspection before final payment is released from escrow.",
    property: {
      stories: 2, foundation: "slab", exterior: "Brick", roofType: "Composition shingle", roofAge: 5,
      garage: "attached", lotSize: "0.22 acres", hoa: true, hoaNotes: "No exterior work restrictions for this scope.",
      heating: "Gas forced air", cooling: "Central AC (4-ton)", waterHeater: "gas", plumbing: "PEX supply, PVC waste",
      electrical: "100A panel (upgrading to 200A)", sewer: "city",
      knownIssues: ["Panel is Federal Pacific (known defect brand)", "Some circuits are double-tapped"],
      recentWork: ["Roof replaced 2021", "Kitchen updated 2019"],
    },
  },
  {
    id: "j3",
    title: "Master Bathroom Full Renovation",
    description:
      "Full gut and renovation of 120 sq ft master bath. Walk-in shower, freestanding tub, double vanity, in-floor heat, and new tile throughout.",
    detailedScope:
      "Demo Phase: Full demolition of existing master bathroom including tub/shower surround, vanity, toilet, flooring, and drywall down to studs. Mold inspection and remediation if found. Haul-away included.\n\nPlumbing Rough-In: Relocate shower drain 18\" for new 60\"x36\" walk-in shower footprint. Add freestanding tub supply and drain rough-in. Install new double vanity supply lines with shutoffs. Replace all galvanized supply lines with PEX.\n\nElectrical: Add dedicated 20A GFCI circuit for in-floor heating system. Install exhaust fan with humidity sensor. Add can lights on dimmer (4 total). Verify existing circuits for vanity lighting.\n\nWaterproofing & Tile: Schluter KERDI membrane in shower. 24x24 porcelain tile floor (owner-supplied). 4x12 subway tile in shower floor-to-ceiling. Mosaic accent band at eye level. Heated floor mat under tile.\n\nFinish: Install owner-supplied 72\" double vanity and mirrors. Moen Brushed Gold fixtures throughout. Frameless glass shower door (3/8\" tempered). Freestanding soaking tub placement and connection.",
    category: "Remodeling",
    subcategory: "Bathroom",
    budget: { min: 18000, max: 32000 },
    location: "San Antonio, TX",
    fullAddress: "1102 Alamo Heights Dr, San Antonio, TX 78209",
    postedBy: "David Anderson",
    postedByRating: 4.6,
    postedByJobs: 2,
    postedByAvatar: "",
    postedDate: "2026-03-10",
    deadline: "2026-05-01",
    preferredStartDate: "2026-04-14",
    estimatedDuration: "3–5 weeks",
    status: "open",
    bidsCount: 3,
    viewCount: 67,
    thumbnail: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&h=300&fit=crop",
    photos: [
      { url: "https://picsum.photos/seed/ftw111/400/400", caption: "Existing bathroom — tub/shower combo", type: "photo" },
      { url: "https://picsum.photos/seed/ftw112/400/400", caption: "Existing vanity and medicine cabinet", type: "photo" },
      { url: "https://picsum.photos/seed/ftw113/400/400", caption: "Floor tile condition — cracking grout", type: "photo" },
      { url: "https://picsum.photos/seed/ftw114/400/400", caption: "Inspiration photo — desired finished look", type: "photo" },
      { url: "https://picsum.photos/seed/ftw115/400/400", caption: "New vanity (already purchased, in garage)", type: "photo" },
    ],
    urgency: "low",
    propertyType: "residential",
    sqft: 120,
    yearBuilt: 1985,
    accessNotes: "House is occupied. Work restricted to 8am–6pm weekdays. Secondary bathroom available for homeowners during renovation. Staging area available in attached garage.",
    materialsProvided: false,
    permitsRequired: true,
    inspectionRequired: true,
    insuranceClaim: false,
    requirements: [
      { label: "Licensed plumber for all rough-in and finish work", met: false },
      { label: "Experience with Schluter waterproofing systems", met: false },
      { label: "Frameless glass shower door installation experience", met: false },
      { label: "Provide tile installation portfolio", met: false },
      { label: "Carry $1M general liability insurance", met: false },
    ],
    tags: ["bathroom", "renovation", "tile", "plumbing", "walk-in-shower", "freestanding-tub", "heated-floor"],
    specialInstructions: "Owner has already purchased vanity, fixtures, and shower door. Contractor provides all other materials. Tile selection is final — do not suggest alternatives. Match grout color exactly to owner-supplied sample.",
    property: {
      stories: 1, foundation: "pier_beam", exterior: "Brick veneer", roofType: "Composition shingle", roofAge: 14,
      garage: "attached", lotSize: "0.21 acres", hoa: false, hoaNotes: "",
      heating: "Gas forced air", cooling: "Central AC (2.5-ton)", waterHeater: "gas", plumbing: "Galvanized supply (partial PEX retrofit), cast iron waste",
      electrical: "150A panel, copper wiring", sewer: "city",
      knownIssues: ["Galvanized supply lines have low pressure in back of house", "Cast iron drain under slab has minor seepage", "Single-pane windows throughout"],
      recentWork: ["HVAC replaced 2019", "Kitchen remodeled 2015", "Roof patched 2020"],
    },
  },
  {
    id: "j4",
    title: "Full Roof Replacement — Insurance Claim Approved",
    description:
      "Insurance claim approved for complete roof replacement after April hail storm. 2,800 sq ft single-story home. Architectural shingles. Supplements welcome.",
    detailedScope:
      "Full Tear-Off: Remove all existing 3-tab shingles and underlayment down to decking. Inspect all decking for damage — replace any soft or compromised sheets at cost per board (supplement to insurance).\n\nDeck Repair: Replace damaged OSB decking as needed. Re-nail any loose decking per code. Install ice and water shield at all eaves, valleys, and penetrations.\n\nNew Roof System: GAF Timberline HDZ architectural shingles in Charcoal (matches existing color). GAF Feltbuster synthetic underlayment full field. New ridge cap shingles. Replace all pipe boots and flashings. Install GAF Cobra Ridge Vent for full ventilation.\n\nGutters & Fascia: Inspect and reseal all gutter end caps. Replace any damaged fascia board sections. Clean gutters of debris post-installation.\n\nInsurance Coordination: Work directly with State Farm adjuster. Provide itemized Xactimate supplement for any additional damage found. Provide photos before, during, and after for claim file.",
    category: "Roofing",
    subcategory: "Full Replacement",
    budget: { min: 10000, max: 15000 },
    location: "Houston, TX",
    fullAddress: "3318 Braeswood Blvd, Houston, TX 77025",
    postedBy: "Patricia Taylor",
    postedByRating: 4.7,
    postedByJobs: 1,
    postedByAvatar: "",
    postedDate: "2026-03-18",
    deadline: "2026-04-10",
    preferredStartDate: "2026-03-25",
    estimatedDuration: "2–3 days",
    status: "open",
    bidsCount: 12,
    viewCount: 218,
    thumbnail: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop",
    photos: [
      { url: "https://picsum.photos/seed/ftw116/400/400", caption: "Hail damage — south slope close-up", type: "photo" },
      { url: "https://picsum.photos/seed/ftw117/400/400", caption: "Hail damage — north slope", type: "photo" },
      { url: "https://picsum.photos/seed/ftw118/400/400", caption: "Damaged pipe boot — needs replacement", type: "photo" },
      { url: "https://picsum.photos/seed/ftw119/400/400", caption: "Gutters — dented from hail impact", type: "photo" },
      { url: "https://picsum.photos/seed/ftw120/400/400", caption: "Full aerial view — drone photo", type: "photo" },
      { url: "https://picsum.photos/seed/ftw121/400/400", caption: "Insurance adjuster report cover page", type: "photo" },
      { url: "https://picsum.photos/seed/ftw122/400/400", caption: "Ridge line condition", type: "photo" },
      { url: "https://picsum.photos/seed/ftw123/400/400", caption: "Attic — existing ventilation", type: "photo" },
    ],
    urgency: "high",
    propertyType: "residential",
    sqft: 2800,
    yearBuilt: 2002,
    accessNotes: "Owner is at work during the day — provide 24-hour notice before start. Neighbor has agreed to allow staging on their driveway. No outdoor pets.",
    materialsProvided: false,
    permitsRequired: true,
    inspectionRequired: true,
    insuranceClaim: true,
    requirements: [
      { label: "GAF Certified roofing contractor preferred", met: false },
      { label: "Insurance restoration experience required", met: false },
      { label: "Xactimate supplement capability strongly preferred", met: false },
      { label: "Texas roofing contractor registration", met: false },
      { label: "Carry $2M general liability + workers comp", met: false },
    ],
    tags: ["roofing", "hail-damage", "insurance-claim", "GAF", "architectural-shingles", "Houston", "storm-damage"],
    specialInstructions: "All work must align with State Farm approved scope. Any supplements must be submitted BEFORE additional work begins. Do not start without signed authorization. Provide before/during/after photo set for the insurance file.",
    property: {
      stories: 1, foundation: "slab", exterior: "Brick veneer", roofType: "3-tab shingle (hail damaged — replacing)", roofAge: 17,
      garage: "attached", lotSize: "0.27 acres", hoa: false, hoaNotes: "",
      heating: "Gas forced air", cooling: "Central AC (3-ton)", waterHeater: "gas", plumbing: "PVC supply and waste",
      electrical: "150A panel, copper wiring", sewer: "city",
      knownIssues: ["Attic ventilation undersized — contributing to shingle wear", "Fascia boards rotted in two sections", "One roof valley showing active slow leak stain in attic"],
      recentWork: ["AC condenser replaced 2021", "Water heater replaced 2018", "Driveway repaired 2020"],
    },
  },
  {
    id: "j5",
    title: "Interior Painting — 4-Bedroom House",
    description:
      "Full interior repaint of 2,400 sq ft home. Walls, ceilings, and trim in all rooms. Owner provides all paint — labor and prep only. Move-in deadline is firm.",
    detailedScope:
      "Prep Work: Fill all nail holes, screw pops, and minor drywall dings throughout house. Caulk all trim, door casings, and window frames. Sand any rough patches. Prime all patched areas and any bare drywall before painting.\n\nScope of Rooms: 4 bedrooms (walls + ceilings), master bathroom (walls only — tile ceiling excluded), hall bath (walls only), living room (walls + ceiling + accent wall), dining room (walls + ceiling), kitchen (walls only — cabinets excluded), hallways and stairwell (walls + ceiling).\n\nPaint Application: All walls receive 2 coats. All ceilings receive 2 coats flat white. All trim and doors receive 2 coats semi-gloss white. Doors get both sides painted.\n\nProtection: All floors protected with ram board or drop cloths. All furniture moved to center and covered. Fixtures masked. Outlet/switch plates removed and replaced after painting.\n\nCleanup: All materials removed from home daily. Final cleanup of all paint drips and overspray before walkthrough.",
    category: "Painting",
    subcategory: "Interior",
    budget: { min: 3000, max: 5500 },
    location: "Fort Worth, TX",
    fullAddress: "5512 Persimmon Hill Dr, Fort Worth, TX 76137",
    postedBy: "Amanda Clark",
    postedByRating: 4.5,
    postedByJobs: 2,
    postedByAvatar: "",
    postedDate: "2026-03-16",
    deadline: "2026-04-20",
    preferredStartDate: "2026-04-07",
    estimatedDuration: "5–7 days",
    status: "open",
    bidsCount: 6,
    viewCount: 93,
    thumbnail: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop",
    photos: [
      { url: "https://picsum.photos/seed/ftw124/400/400", caption: "Living room — current color (greige)", type: "photo" },
      { url: "https://picsum.photos/seed/ftw125/400/400", caption: "Master bedroom — scuff marks on walls", type: "photo" },
      { url: "https://picsum.photos/seed/ftw126/400/400", caption: "Hallway — trim to be painted", type: "photo" },
      { url: "https://picsum.photos/seed/ftw127/400/400", caption: "Kitchen walls — grease stains need priming", type: "photo" },
      { url: "https://picsum.photos/seed/ftw128/400/400", caption: "Paint swatches — Sherwin-Williams Mindful Gray main, Pure White trim", type: "photo" },
    ],
    urgency: "medium",
    propertyType: "residential",
    sqft: 2400,
    yearBuilt: 2009,
    accessNotes: "House is vacant — moving in April 25. Lockbox code provided after bid acceptance. Work any hours 7am–8pm. No pets or children on premises.",
    materialsProvided: true,
    permitsRequired: false,
    inspectionRequired: false,
    insuranceClaim: false,
    requirements: [
      { label: "Minimum 5 years interior painting experience", met: false },
      { label: "References from similar-sized whole-house projects", met: false },
      { label: "Must complete all work before April 20 firm deadline", met: false },
    ],
    tags: ["painting", "interior", "whole-house", "Fort-Worth", "labor-only", "move-in-ready"],
    specialInstructions: "All paint is staged in the garage — do not mix with any other products. Owner selected Sherwin-Williams Mindful Gray for all walls, Pure White for all trim and ceilings. Accent wall in living room is Sherwin-Williams Naval. Do not deviate from color plan without written approval.",
    property: {
      stories: 2, foundation: "slab", exterior: "Brick and stone veneer", roofType: "Composition shingle", roofAge: 4,
      garage: "attached", lotSize: "0.19 acres", hoa: true, hoaNotes: "No work on Sundays. Dumpsters require HOA approval.",
      heating: "Gas forced air", cooling: "Central AC (4-ton, dual zone)", waterHeater: "tankless_gas", plumbing: "PEX supply, PVC waste",
      electrical: "200A panel, copper wiring", sewer: "city",
      knownIssues: ["Scuff marks and nail holes throughout from previous tenants", "Grease buildup on kitchen walls requires oil-based primer before painting"],
      recentWork: ["Roof replaced 2022", "Tankless water heater installed 2021", "Carpet removed from downstairs 2023"],
    },
  },
  {
    id: "j6",
    title: "Engineered Hardwood Installation — 1,100 sq ft",
    description:
      "Remove existing carpet and install 5\" wide engineered hardwood throughout main floor living areas. Owner has purchased flooring. Labor and prep only.",
    detailedScope:
      "Demo: Pull and dispose of all existing carpet and carpet pad in living room, dining room, hallway, and office (approximately 1,100 sq ft total). Pull all tack strips and staples. Inspect subfloor for squeaks, soft spots, and high/low areas.\n\nSubfloor Prep: Renail any squeaky subfloor sections. Fill low spots with self-leveling compound as needed (floor must be within 3/16\" over 10 ft). Sand any high spots. Sweep and vacuum entire subfloor before installation.\n\nInstallation: Install engineered hardwood (owner-supplied Pergo PureSeal 5\" Oak — 1,250 sq ft staged in home). Float installation method over existing hardwood subfloor per manufacturer specs. Stagger all end joints minimum 6\". Maintain proper expansion gap at all walls and vertical surfaces.\n\nTrim Work: Install new shoe molding throughout (owner prefers painted MDF to match existing trim). Cut and install transition strips at tile kitchen entry and front door threshold. Install quarter round in all closets.",
    category: "Flooring",
    subcategory: "Hardwood",
    budget: { min: 4500, max: 8000 },
    location: "Austin, TX",
    fullAddress: "2201 Barton Hills Dr, Austin, TX 78704",
    postedBy: "Thomas Harris",
    postedByRating: 4.9,
    postedByJobs: 4,
    postedByAvatar: "",
    postedDate: "2026-03-14",
    deadline: "2026-04-25",
    preferredStartDate: "2026-04-10",
    estimatedDuration: "3–4 days",
    status: "open",
    bidsCount: 5,
    viewCount: 77,
    thumbnail: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=400&h=300&fit=crop",
    photos: [
      { url: "https://picsum.photos/seed/ftw129/400/400", caption: "Existing carpet — living room", type: "photo" },
      { url: "https://picsum.photos/seed/ftw130/400/400", caption: "Existing carpet — dining room and hallway", type: "photo" },
      { url: "https://picsum.photos/seed/ftw131/400/400", caption: "Subfloor inspection — minor squeak area", type: "photo" },
      { url: "https://picsum.photos/seed/ftw132/400/400", caption: "Owner-supplied flooring — staged in garage", type: "photo" },
    ],
    urgency: "low",
    propertyType: "residential",
    sqft: 1100,
    yearBuilt: 1994,
    accessNotes: "Owner is home. All furniture will be moved before start date. Small dog in home — please ensure exterior doors stay closed. Staging area in attached garage.",
    materialsProvided: true,
    permitsRequired: false,
    inspectionRequired: false,
    insuranceClaim: false,
    requirements: [
      { label: "Engineered hardwood float installation experience required", met: false },
      { label: "Demonstrate subfloor leveling process", met: false },
      { label: "Provide completed project photos for reference", met: false },
    ],
    tags: ["flooring", "hardwood", "engineered", "labor-only", "carpet-removal", "Austin", "Pergo"],
    specialInstructions: "Do not use any nail-down method — float only per Pergo specs. Acclimate flooring 72 hours before installation — it is already in the home. Protect kitchen tile during installation. Match transition strip finish to existing brushed nickel threshold at front entry.",
    property: {
      stories: 1, foundation: "slab", exterior: "HardiePlank lap siding", roofType: "Composition shingle", roofAge: 6,
      garage: "attached", lotSize: "0.16 acres", hoa: true, hoaNotes: "Quiet hours 9pm–7am. Debris bins must be removed same day.",
      heating: "Gas forced air", cooling: "Central AC (2-ton)", waterHeater: "tankless_gas", plumbing: "PEX supply, PVC waste",
      electrical: "200A panel, copper wiring", sewer: "city",
      knownIssues: ["Subfloor has minor squeaking in dining room area", "Carpet staples from original install may require extra removal effort"],
      recentWork: ["HVAC replaced 2022", "Exterior painted 2023", "Water heater replaced 2020"],
    },
  },
  {
    id: "j7",
    title: "HVAC System Replacement — 3-Ton Whole Home",
    description:
      "Replace failed 14-year-old HVAC system with new high-efficiency unit. 3-ton system for 1,800 sq ft home. System completely down — urgent timeline needed.",
    detailedScope:
      "Equipment Removal: Safely decommission and remove existing Carrier 3-ton split system (condenser and air handler). Recover refrigerant per EPA regulations. Disconnect and cap existing refrigerant lines if replacing line set.\n\nNew System Installation: Install new 16+ SEER2 3-ton split system (suggest Carrier, Trane, or Lennox — homeowner open to recommendation). Air handler in attic — ensure proper condensate drain line and secondary pan. New condenser on existing pad — check and level if needed.\n\nLine Set: Inspect existing line set — replace if copper has any visible damage or if system efficiency requires it. Install new UV-resistant insulation on suction line.\n\nAirflow & Ductwork: Inspect all accessible ductwork for leaks. Seal any visible duct leaks with mastic. Balance system — all vents must achieve proper airflow.\n\nControls: Install new Ecobee Smart Thermostat (owner-supplied). Register new equipment warranty. Provide owner with all documentation.\n\nComfort Guarantee: System must achieve target temperature within 1 hour of startup on a 95°F day. Texas summers won't wait.",
    category: "HVAC",
    subcategory: "System Replacement",
    budget: { min: 7500, max: 12000 },
    location: "Round Rock, TX",
    fullAddress: "1405 Red Bud Trail, Round Rock, TX 78681",
    postedBy: "Kevin Martinez",
    postedByRating: 4.7,
    postedByJobs: 2,
    postedByAvatar: "",
    postedDate: "2026-03-18",
    deadline: "2026-03-28",
    preferredStartDate: "2026-03-21",
    estimatedDuration: "1–2 days",
    status: "open",
    bidsCount: 9,
    viewCount: 187,
    thumbnail: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop",
    photos: [
      { url: "https://picsum.photos/seed/ftw133/400/400", caption: "Failed condenser — refrigerant leak visible", type: "photo" },
      { url: "https://picsum.photos/seed/ftw134/400/400", caption: "Air handler in attic — original 2012 unit", type: "photo" },
      { url: "https://picsum.photos/seed/ftw135/400/400", caption: "Condenser pad — level and clear", type: "photo" },
      { url: "https://picsum.photos/seed/ftw136/400/400", caption: "Existing thermostat location", type: "photo" },
      { url: "https://picsum.photos/seed/ftw137/400/400", caption: "Attic access — pull-down stairs, clear path", type: "photo" },
    ],
    urgency: "high",
    propertyType: "residential",
    sqft: 1800,
    yearBuilt: 2008,
    accessNotes: "Family of 4 in home with no AC — extremely time-sensitive. Attic access through hallway pull-down stairs. Clear path to unit. Can be on-site for any access needs.",
    materialsProvided: false,
    permitsRequired: true,
    inspectionRequired: true,
    insuranceClaim: false,
    requirements: [
      { label: "Texas HVAC contractor license required", met: false },
      { label: "EPA 608 certified technician on job", met: false },
      { label: "Available to start within 3 days", met: false },
      { label: "Carry $1M general liability insurance", met: false },
    ],
    tags: ["HVAC", "AC", "replacement", "3-ton", "Round-Rock", "urgent", "Ecobee"],
    specialInstructions: "System is completely failed — family has no AC. Please prioritize response time. All bids must include equipment make and model, efficiency rating, and warranty terms. No window units — homeowner wants full system replacement only.",
    property: {
      stories: 1, foundation: "slab", exterior: "Brick veneer", roofType: "Composition shingle", roofAge: 9,
      garage: "attached", lotSize: "0.23 acres", hoa: true, hoaNotes: "Equipment staging in driveway only. No work Sundays.",
      heating: "Gas forced air", cooling: "Central AC (3-ton, failed)", waterHeater: "gas", plumbing: "PEX supply, PVC waste",
      electrical: "200A panel, copper wiring", sewer: "city",
      knownIssues: ["HVAC system completely failed — condenser refrigerant leak", "Ductwork has minor gaps at two flex duct connections in attic", "Attic insulation is R-19 — below current code recommended R-38"],
      recentWork: ["Roof replaced 2017", "Water heater replaced 2020", "Smart thermostat installed 2022"],
    },
  },
  {
    id: "j8",
    title: "Privacy Fence Installation — 200 LF Cedar",
    description:
      "Install new 6-foot cedar privacy fence along rear and side property lines. Replace existing rotted fence. Posts set in concrete. Double gate for backyard access.",
    detailedScope:
      "Demo & Disposal: Remove and haul away all existing rotted fence sections (approximately 185 LF of old wood fence). Pull existing posts — some may require digging out if concrete footings are present.\n\nLayout & Posts: Locate property corners with owner-provided survey stakes. Layout fence line per property survey. Set 4x4 cedar posts in concrete every 8 ft on center. Posts must be plumb — checked with level after each set. Allow concrete to cure minimum 24 hours before attaching panels.\n\nPanel Construction: Build custom board-on-board cedar panels with 2x4 horizontal rails (top, middle, and bottom). 6-foot dog-eared cedar pickets — overlapping board-on-board style for privacy and wind resistance. No gaps from any angle.\n\nGate: Install 5-ft wide double gate on rear fence line (driveway access). Double steel drive gate hinges rated for cedar weight. Heavy-duty cane bolt on stationary side. Thumb latch with key lock on active side.\n\nFinish: Apply one coat of clear cedar preservative to all exposed lumber before completion. Clean up all debris and wood scraps daily.",
    category: "Fencing",
    subcategory: "Privacy Fence",
    budget: { min: 5500, max: 9000 },
    location: "Georgetown, TX",
    fullAddress: "408 River Bend Rd, Georgetown, TX 78628",
    postedBy: "Sandra Lopez",
    postedByRating: 4.4,
    postedByJobs: 1,
    postedByAvatar: "",
    postedDate: "2026-03-13",
    deadline: "2026-04-18",
    preferredStartDate: "2026-04-01",
    estimatedDuration: "3–4 days",
    status: "open",
    bidsCount: 5,
    viewCount: 54,
    thumbnail: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400&h=300&fit=crop",
    photos: [
      { url: "https://picsum.photos/seed/ftw138/400/400", caption: "Existing fence — rear property line, rotted", type: "photo" },
      { url: "https://picsum.photos/seed/ftw139/400/400", caption: "Existing fence — side yard, leaning", type: "photo" },
      { url: "https://picsum.photos/seed/ftw140/400/400", caption: "Gate opening location — rear driveway access", type: "photo" },
      { url: "https://picsum.photos/seed/ftw141/400/400", caption: "Property survey stakes — rear corner", type: "photo" },
    ],
    urgency: "medium",
    propertyType: "residential",
    sqft: 0,
    yearBuilt: 1997,
    accessNotes: "Rear yard accessible via driveway on west side. HOA approval already obtained — copy provided. Call before arriving. Neighbor's dogs along east fence line — coordinate carefully.",
    materialsProvided: false,
    permitsRequired: true,
    inspectionRequired: false,
    insuranceClaim: false,
    requirements: [
      { label: "Call 811 before any digging — confirm utility locate completed", met: false },
      { label: "Provide material list including lumber grade", met: false },
      { label: "HOA approval already obtained — match board-on-board style", met: false },
      { label: "Minimum 5 years fence installation experience", met: false },
    ],
    tags: ["fence", "cedar", "privacy", "board-on-board", "Georgetown", "gate", "HOA-approved"],
    specialInstructions: "HOA requires board-on-board style matching neighboring properties. All cedar must be #2 grade or better. Post depth minimum 2 ft in concrete. Gate must be operational and level before final payment. Survey stakes are marked with orange flags — do not move them.",
    property: {
      stories: 2, foundation: "slab", exterior: "Brick and stone veneer", roofType: "Composition shingle", roofAge: 3,
      garage: "attached", lotSize: "0.28 acres", hoa: true, hoaNotes: "HOA approval already obtained for this fence project. Board-on-board style required.",
      heating: "Gas forced air", cooling: "Central AC (3.5-ton)", waterHeater: "tankless_gas", plumbing: "PEX supply, PVC waste",
      electrical: "200A panel, copper wiring", sewer: "city",
      knownIssues: ["Existing fence posts rotted at grade on rear line", "East side fence leaning — original posts never set in concrete"],
      recentWork: ["Roof installed 2022", "Landscaping completed 2021", "Driveway sealed 2023"],
    },
  },
  {
    id: "j9",
    title: "Concrete Driveway Replacement — 800 sq ft",
    description:
      "Remove and replace existing cracked concrete driveway. Single-car width widens to double at garage apron. 800 sq ft total. Broom finish preferred.",
    detailedScope:
      "Demo: Jackhammer and remove existing 4-inch concrete driveway slab (800 sq ft). Load and haul all concrete debris. Grade and compact existing base — add 4 inches of crushed limestone base material if needed.\n\nForms & Layout: Set forms for new driveway — 12 ft wide from street to single-car garage opening, widens to 20 ft at apron. Maintain minimum 2% slope away from garage. Expansion joints at garage apron, property line, and every 10 ft.\n\nReinforcement: Place #3 rebar on 18\" grid throughout. Chair all rebar 1.5\" off sub-base. Tie all intersections with wire.\n\nPour & Finish: Pour 4-inch thick 4000 PSI concrete. Broom finish texture for slip resistance. Tooled edges and control joints per layout. Protect with curing compound immediately after finishing.\n\nCuring: Wet cure or cure compound for minimum 7 days. No vehicle traffic for 7 days, no heavy loads for 28 days. Provide written curing instructions to homeowner.\n\nCleanup: Remove all forms and debris. Grade any disturbed lawn areas with topsoil.",
    category: "Concrete",
    subcategory: "Flatwork",
    budget: { min: 8000, max: 14000 },
    location: "Pflugerville, TX",
    fullAddress: "19023 Moreau Dr, Pflugerville, TX 78660",
    postedBy: "Greg Nguyen",
    postedByRating: 4.8,
    postedByJobs: 2,
    postedByAvatar: "",
    postedDate: "2026-03-12",
    deadline: "2026-04-30",
    preferredStartDate: "2026-04-14",
    estimatedDuration: "3–5 days",
    status: "open",
    bidsCount: 6,
    viewCount: 71,
    thumbnail: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&h=300&fit=crop",
    photos: [
      { url: "https://picsum.photos/seed/ftw142/400/400", caption: "Existing driveway — full view from street", type: "photo" },
      { url: "https://picsum.photos/seed/ftw143/400/400", caption: "Crack patterns — freeze-thaw damage", type: "photo" },
      { url: "https://picsum.photos/seed/ftw144/400/400", caption: "Garage apron — settled 2 inches", type: "photo" },
      { url: "https://picsum.photos/seed/ftw145/400/400", caption: "Street approach — existing curb cut in good shape", type: "photo" },
      { url: "https://picsum.photos/seed/ftw146/400/400", caption: "Side view — slope toward house (incorrect grade)", type: "photo" },
    ],
    urgency: "low",
    propertyType: "residential",
    sqft: 800,
    yearBuilt: 2001,
    accessNotes: "Both vehicles must park on street during construction — owner understands this. Call 811 utility locate must be completed before demo. Neighbor's mailbox post is close to property line on south side — protect it.",
    materialsProvided: false,
    permitsRequired: true,
    inspectionRequired: false,
    insuranceClaim: false,
    requirements: [
      { label: "Experienced concrete flatwork contractor", met: false },
      { label: "Provide concrete mix design and PSI specification", met: false },
      { label: "Call 811 and obtain utility locate before demo", met: false },
      { label: "Submit City of Pflugerville driveway permit", met: false },
    ],
    tags: ["concrete", "driveway", "flatwork", "Pflugerville", "demo", "rebar", "broom-finish"],
    specialInstructions: "Current driveway slopes toward garage — new driveway MUST slope away at minimum 2%. Verify grade before pouring. Owner wants broom finish, not exposed aggregate. Include expansion joint locations in your bid drawing.",
    property: {
      stories: 1, foundation: "pier_beam", exterior: "Brick veneer", roofType: "Composition shingle", roofAge: 18,
      garage: "attached", lotSize: "0.31 acres", hoa: false, hoaNotes: "",
      heating: "Gas forced air", cooling: "Central AC (2.5-ton)", waterHeater: "gas", plumbing: "Galvanized supply (corroding), cast iron waste",
      electrical: "100A panel, aluminum branch wiring in some areas", sewer: "septic",
      knownIssues: ["Driveway slopes toward garage — water intrusion issues in heavy rain", "Galvanized supply lines have significant corrosion and pressure loss", "100A panel is undersized for modern loads", "Septic system last pumped 2019 — unknown current condition"],
      recentWork: ["AC unit replaced 2018", "Water heater replaced 2021", "Foundation piers re-leveled 2016"],
    },
  },
  {
    id: "j10",
    title: "Outdoor Kitchen + Covered Patio Build",
    description:
      "Build new covered patio with full outdoor kitchen. Steel pergola or solid cover, gas grill station, sink with hot/cold, bar seating for 6, built-in kamado smoker, and ambient lighting.",
    detailedScope:
      "Concrete & Foundation: Pour new 20x30 ft concrete patio slab (600 sq ft) adjacent to existing home foundation. 4000 PSI, 5-inch thick with #4 rebar on 16\" grid. Integrated footings for pergola posts. Broom finish with exposed aggregate border.\n\nPatio Cover: Install 20x30 ft aluminum solid insulated roof panel system (Equinox or similar). Four 6x6 steel posts with decorative brackets. Must tie into existing roofline at house. Gutters on all three exterior edges.\n\nOutdoor Kitchen Build-Out: Construct L-shaped outdoor kitchen island using 16-gauge steel stud frame with Hardiebacker and stone veneer (owner to select stone). Install 36\" Napoleon PRO665 built-in gas grill. Install 24\" Delta Heat refrigerator drawer. 304 stainless steel countertop throughout. Deep single undermount sink with Moen outdoor faucet. Built-in ice maker rough-in (owner to supply unit later).\n\nKamado Station: Pour reinforced kamado base pad. Build surrounding stone veneer enclosure with custom SS door for storage. Owner-supplied Big Green Egg XL to be set into island.\n\nUtilities: Run dedicated 20A circuit from main panel for refrigerator, lighting, and outlets (GFCI throughout). Extend existing gas line for grill and side burner connection. Plumb hot and cold water supply with drain to French drain system.\n\nLighting & Finish: 6 recessed LED can lights in patio ceiling. LED strip under counter. 2 outdoor sconces on house wall. All electrical GFCI. Stone veneer on all kitchen faces. Seal all grout and stone on completion.",
    category: "Outdoor Living",
    subcategory: "Outdoor Kitchen",
    budget: { min: 35000, max: 55000 },
    location: "Cedar Park, TX",
    fullAddress: "312 Lakeview Hollow Ln, Cedar Park, TX 78613",
    postedBy: "Brian Callahan",
    postedByRating: 4.9,
    postedByJobs: 5,
    postedByAvatar: "",
    postedDate: "2026-03-11",
    deadline: "2026-06-01",
    preferredStartDate: "2026-04-21",
    estimatedDuration: "6–9 weeks",
    status: "open",
    bidsCount: 3,
    viewCount: 132,
    thumbnail: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
    photos: [
      { url: "https://picsum.photos/seed/ftw147/400/400", caption: "Existing backyard — build area cleared", type: "photo" },
      { url: "https://picsum.photos/seed/ftw148/400/400", caption: "Existing back door and porch stoop", type: "photo" },
      { url: "https://picsum.photos/seed/ftw149/400/400", caption: "Gas meter location — side yard", type: "photo" },
      { url: "https://picsum.photos/seed/ftw150/400/400", caption: "Owner inspiration — L-shaped kitchen layout", type: "photo" },
      { url: "https://picsum.photos/seed/ftw151/400/400", caption: "Stone veneer sample — Hill Country limestone", type: "photo" },
      { url: "https://picsum.photos/seed/ftw152/400/400", caption: "Big Green Egg XL — already owned by homeowner", type: "photo" },
      { url: "https://picsum.photos/seed/ftw153/400/400", caption: "Napoleon PRO665 grill — spec sheet included", type: "photo" },
    ],
    urgency: "low",
    propertyType: "residential",
    sqft: 600,
    yearBuilt: 2016,
    accessNotes: "Backyard access through 6-ft side gate on right side of house (code 1492). Work hours 7am–7pm weekdays, 8am–5pm Saturdays. Owner has three children — keep gate secured at all times.",
    materialsProvided: false,
    permitsRequired: true,
    inspectionRequired: true,
    insuranceClaim: false,
    requirements: [
      { label: "Experience with outdoor kitchen construction portfolio required", met: false },
      { label: "Licensed sub for gas line extension required", met: false },
      { label: "Licensed electrician for GFCI and panel work required", met: false },
      { label: "Experience with insulated patio cover systems", met: false },
      { label: "Pull City of Cedar Park permit — setback review required", met: false },
    ],
    tags: ["outdoor-kitchen", "patio", "pergola", "stone-veneer", "gas-grill", "Cedar-Park", "Big-Green-Egg", "concrete"],
    specialInstructions: "Owner wants Hill Country limestone veneer only — no manufactured stone. Grill station must be positioned to minimize smoke blowing toward back door (consider wind direction). All gas connections require licensed plumber sign-off. Submit 3D rendering or detailed layout drawing with your bid for consideration.",
    property: {
      stories: 2, foundation: "slab", exterior: "Stone veneer and stucco", roofType: "Composition shingle", roofAge: 7,
      garage: "attached", lotSize: "0.42 acres", hoa: true, hoaNotes: "Outdoor structure requires HOA approval — obtain before permit. Work hours 7am–7pm weekdays only.",
      heating: "Gas forced air", cooling: "Central AC (4-ton, dual zone)", waterHeater: "tankless_gas", plumbing: "PEX supply, PVC waste",
      electrical: "200A panel, copper wiring", sewer: "septic",
      knownIssues: ["Septic system will need inspection before adding outdoor kitchen drain load", "Existing back patio slab is cracked — will be incorporated into new pour area"],
      recentWork: ["Roof replaced 2019", "Interior remodeled 2022", "Landscaping and irrigation installed 2021"],
    },
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
    clientName: "Patricia Taylor",
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
    id: "e6",
    jobTitle: "Garage Conversion",
    clientName: "David Park",
    amount: 27500,
    status: "sent",
    createdDate: "2026-03-17",
    sentDate: "2026-03-17",
    lineItems: [
      { description: "Framing & Insulation", quantity: 1, unitPrice: 6500 },
      { description: "Electrical Rough-In", quantity: 1, unitPrice: 3200 },
      { description: "Drywall & Finish", quantity: 1, unitPrice: 4800 },
      { description: "Flooring (LVP)", quantity: 450, unitPrice: 8 },
      { description: "Mini-Split HVAC", quantity: 1, unitPrice: 4200 },
      { description: "Labor", quantity: 60, unitPrice: 85 },
    ],
  },
  {
    id: "e7",
    jobTitle: "Patio Cover & Outdoor Kitchen",
    clientName: "Amanda Torres",
    amount: 41200,
    status: "viewed",
    createdDate: "2026-03-15",
    sentDate: "2026-03-15",
    lineItems: [
      { description: "Patio Cover (20x14)", quantity: 1, unitPrice: 12000 },
      { description: "Outdoor Kitchen Island", quantity: 1, unitPrice: 8500 },
      { description: "Gas Line & Plumbing", quantity: 1, unitPrice: 3800 },
      { description: "Electrical & Lighting", quantity: 1, unitPrice: 2900 },
      { description: "Concrete Pad", quantity: 280, unitPrice: 18 },
      { description: "Labor", quantity: 90, unitPrice: 85 },
    ],
  },
  {
    id: "e8",
    jobTitle: "Master Closet Buildout",
    clientName: "Jason Lee",
    amount: 9800,
    status: "sent",
    createdDate: "2026-03-19",
    sentDate: "2026-03-19",
    lineItems: [
      { description: "Custom Shelving System", quantity: 1, unitPrice: 4200 },
      { description: "LED Lighting", quantity: 1, unitPrice: 1100 },
      { description: "Trim & Paint", quantity: 1, unitPrice: 1500 },
      { description: "Labor", quantity: 36, unitPrice: 83 },
    ],
  },
  {
    id: "e9",
    jobTitle: "Whole-House Repipe (PEX)",
    clientName: "Linda Okafor",
    amount: 14500,
    status: "sent",
    createdDate: "2026-03-18",
    sentDate: "2026-03-18",
    lineItems: [
      { description: "PEX Material & Fittings", quantity: 1, unitPrice: 4200 },
      { description: "Demo Existing Copper", quantity: 1, unitPrice: 2800 },
      { description: "Drywall Patch & Repair", quantity: 1, unitPrice: 1800 },
      { description: "Labor", quantity: 68, unitPrice: 84 },
    ],
  },
  {
    id: "e10",
    jobTitle: "Exterior Paint - 2-Story",
    clientName: "Kevin Nguyen",
    amount: 11200,
    status: "viewed",
    createdDate: "2026-03-13",
    sentDate: "2026-03-13",
    lineItems: [
      { description: "Pressure Wash & Prep", quantity: 1, unitPrice: 1800 },
      { description: "Primer (2 coats)", quantity: 1, unitPrice: 2400 },
      { description: "Paint (Sherwin-Williams)", quantity: 28, unitPrice: 65 },
      { description: "Trim & Detail Work", quantity: 1, unitPrice: 2200 },
      { description: "Labor", quantity: 40, unitPrice: 75 },
    ],
  },
  {
    id: "e11",
    jobTitle: "Concrete Driveway Replace",
    clientName: "Rachel Cooper",
    amount: 18900,
    status: "sent",
    createdDate: "2026-03-19",
    sentDate: "2026-03-20",
    lineItems: [
      { description: "Demo & Haul-Off", quantity: 1, unitPrice: 3200 },
      { description: "Grading & Base Prep", quantity: 1, unitPrice: 2100 },
      { description: "Concrete (6\" reinforced)", quantity: 680, unitPrice: 12 },
      { description: "Stamped Finish", quantity: 1, unitPrice: 2800 },
      { description: "Labor", quantity: 48, unitPrice: 80 },
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

export const mockFairRecords: FairRecord[] = [
  {
    id: "fr1",
    publicId: "FR-A3X9K2",
    projectId: "p3",
    contractorId: "c1",
    homeownerId: "h1",
    category: "Painting",
    locationCity: "Austin",
    scopeSummary: "Full interior painting — 4 bedrooms, 2 bathrooms, living area, hallways. Walls prepped, primed (2 coats), painted with Sherwin-Williams Cashmere. Ceiling paint in all rooms. Trim and baseboards painted semi-gloss white.",
    estimatedBudget: 4200,
    finalCost: 4200,
    budgetAccuracyPct: 100,
    onBudget: true,
    estimatedEndDate: "2026-01-20",
    actualCompletionDate: "2026-01-18",
    onTime: true,
    qualityScoreAtCompletion: 94,
    avgRating: 4.9,
    reviewCount: 127,
    disputeCount: 0,
    photos: [],
    homeownerConfirmed: true,
    confirmedAt: "2026-01-19T14:30:00Z",
    contractorName: "Marcus Johnson",
    contractorCompany: "Johnson & Sons Construction",
    contractorRating: 4.9,
    contractorJobsCompleted: 127,
    projectTitle: "Interior Painting",
  },
  {
    id: "fr2",
    publicId: "FR-B7M4P1",
    projectId: "p4",
    contractorId: "c1",
    homeownerId: "h2",
    category: "Remodeling",
    locationCity: "Austin",
    scopeSummary: "Complete kitchen remodel — demo existing cabinets, new custom shaker cabinets, quartz countertops, subway tile backsplash, plumbing rough-in for relocated sink, electrical for under-cabinet lighting and new appliance circuits.",
    estimatedBudget: 38500,
    finalCost: 36800,
    budgetAccuracyPct: 95.6,
    onBudget: true,
    estimatedEndDate: "2026-02-28",
    actualCompletionDate: "2026-03-02",
    onTime: false,
    qualityScoreAtCompletion: 92,
    avgRating: 4.9,
    reviewCount: 128,
    disputeCount: 0,
    photos: [],
    homeownerConfirmed: true,
    confirmedAt: "2026-03-03T10:15:00Z",
    contractorName: "Marcus Johnson",
    contractorCompany: "Johnson & Sons Construction",
    contractorRating: 4.9,
    contractorJobsCompleted: 128,
    projectTitle: "Kitchen Remodel",
  },
  {
    id: "fr3",
    publicId: "FR-C2J8N5",
    projectId: "p5",
    contractorId: "c1",
    homeownerId: "h3",
    category: "Electrical",
    locationCity: "Round Rock",
    scopeSummary: "200A electrical panel upgrade — replaced Federal Pacific panel with Square D Homeline. New grounding rod, updated service entrance cable, 20 circuit breakers reorganized and labeled. Whole-house surge protector installed.",
    estimatedBudget: 4800,
    finalCost: 5100,
    budgetAccuracyPct: 93.8,
    onBudget: true,
    estimatedEndDate: "2026-01-15",
    actualCompletionDate: "2026-01-14",
    onTime: true,
    qualityScoreAtCompletion: 91,
    avgRating: 4.8,
    reviewCount: 125,
    disputeCount: 0,
    photos: [],
    homeownerConfirmed: true,
    confirmedAt: "2026-01-15T09:00:00Z",
    contractorName: "Marcus Johnson",
    contractorCompany: "Johnson & Sons Construction",
    contractorRating: 4.9,
    contractorJobsCompleted: 125,
    projectTitle: "Electrical Panel Upgrade",
  },
  {
    id: "fr4",
    publicId: "FR-D5R3W8",
    projectId: "p6",
    contractorId: "c1",
    homeownerId: "h4",
    category: "Roofing",
    locationCity: "Cedar Park",
    scopeSummary: "Full roof replacement — tear-off existing composition shingles, inspect and replace damaged decking (4 sheets OSB replaced), new GAF Timberline HDZ shingles (Charcoal), new flashing at all penetrations, ridge vent installation.",
    estimatedBudget: 12500,
    finalCost: 13200,
    budgetAccuracyPct: 94.4,
    onBudget: true,
    estimatedEndDate: "2025-12-20",
    actualCompletionDate: "2025-12-19",
    onTime: true,
    qualityScoreAtCompletion: 93,
    avgRating: 4.9,
    reviewCount: 122,
    disputeCount: 0,
    photos: [],
    homeownerConfirmed: true,
    confirmedAt: "2025-12-20T16:00:00Z",
    contractorName: "Marcus Johnson",
    contractorCompany: "Johnson & Sons Construction",
    contractorRating: 4.9,
    contractorJobsCompleted: 122,
    projectTitle: "Roof Replacement",
  },
  {
    id: "fr5",
    publicId: "FR-E9T6L3",
    projectId: "p7",
    contractorId: "c1",
    homeownerId: "h5",
    category: "Concrete",
    locationCity: "Pflugerville",
    scopeSummary: "Driveway replacement — removed and hauled existing cracked concrete (680 sqft), graded and compacted base, poured 6-inch reinforced concrete with fiber mesh, stamped finish (Ashlar Slate pattern), sealed with acrylic sealer.",
    estimatedBudget: 8500,
    finalCost: 8500,
    budgetAccuracyPct: 100,
    onBudget: true,
    estimatedEndDate: "2025-11-15",
    actualCompletionDate: "2025-11-14",
    onTime: true,
    qualityScoreAtCompletion: 90,
    avgRating: 4.8,
    reviewCount: 119,
    disputeCount: 0,
    photos: [],
    homeownerConfirmed: true,
    confirmedAt: "2025-11-15T11:30:00Z",
    contractorName: "Marcus Johnson",
    contractorCompany: "Johnson & Sons Construction",
    contractorRating: 4.9,
    contractorJobsCompleted: 119,
    projectTitle: "Concrete Driveway Replace",
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
