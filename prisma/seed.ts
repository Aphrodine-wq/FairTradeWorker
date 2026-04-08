import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const isRemote = process.env.DATABASE_URL?.includes("render.com");
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding FTW database...");

  const password = await bcrypt.hash("demo1234", 12);

  // ── Homeowners ──────────────────────────────────────────────────
  const homeowner1User = await prisma.user.create({
    data: {
      email: "maria.santos@example.com",
      passwordHash: password,
      name: "Maria Santos",
      phone: "512-555-0101",
      roles: ["HOMEOWNER"],
      activeRole: "HOMEOWNER",
      emailVerified: true,
      homeowner: {
        create: {
          location: "Oxford, MS",
          propertyType: "RESIDENTIAL",
        },
      },
    },
  });

  const homeowner2User = await prisma.user.create({
    data: {
      email: "david.park@example.com",
      passwordHash: password,
      name: "David Park",
      phone: "214-555-0202",
      roles: ["HOMEOWNER"],
      activeRole: "HOMEOWNER",
      emailVerified: true,
      homeowner: {
        create: {
          location: "Tupelo, MS",
          propertyType: "RESIDENTIAL",
        },
      },
    },
  });

  const homeowner3User = await prisma.user.create({
    data: {
      email: "rachel.turner@example.com",
      passwordHash: password,
      name: "Rachel Turner",
      phone: "210-555-0303",
      roles: ["HOMEOWNER"],
      activeRole: "HOMEOWNER",
      emailVerified: true,
      homeowner: {
        create: {
          location: "Hattiesburg, MS",
          propertyType: "RESIDENTIAL",
        },
      },
    },
  });

  // ── Contractors ─────────────────────────────────────────────────
  const contractor1User = await prisma.user.create({
    data: {
      email: "marcus.johnson@example.com",
      passwordHash: password,
      name: "Marcus Johnson",
      phone: "512-555-1001",
      roles: ["CONTRACTOR"],
      activeRole: "CONTRACTOR",
      emailVerified: true,
      contractor: {
        create: {
          company: "Johnson & Sons Construction",
          bio: "Third-generation contractor specializing in residential remodels and new construction. Licensed and insured with a commitment to quality craftsmanship.",
          specialty: "General Contracting",
          skills: ["Framing", "Finish Carpentry", "Project Management", "Concrete"],
          location: "Oxford, MS",
          serviceRadius: 50,
          yearsExperience: 15,
          hourlyRate: 85,
          verified: true,
          licensed: true,
          insured: true,
          fairTradePromise: true,
          rating: 4.9,
          reviewCount: 127,
          jobsCompleted: 342,
        },
      },
    },
  });

  const contractor2User = await prisma.user.create({
    data: {
      email: "sarah.chen@example.com",
      passwordHash: password,
      name: "Sarah Chen",
      phone: "214-555-1002",
      roles: ["CONTRACTOR"],
      activeRole: "CONTRACTOR",
      emailVerified: true,
      contractor: {
        create: {
          company: "Precision Electric LLC",
          bio: "Master electrician with expertise in residential and light commercial work. Specializing in panel upgrades, EV charger installations, and smart home wiring.",
          specialty: "Electrical",
          skills: ["Panel Upgrades", "EV Chargers", "Smart Home", "Troubleshooting"],
          location: "Tupelo, MS",
          serviceRadius: 40,
          yearsExperience: 12,
          hourlyRate: 95,
          verified: true,
          licensed: true,
          insured: true,
          fairTradePromise: true,
          rating: 4.8,
          reviewCount: 89,
          jobsCompleted: 256,
        },
      },
    },
  });

  const contractor3User = await prisma.user.create({
    data: {
      email: "robert.garcia@example.com",
      passwordHash: password,
      name: "Robert Garcia",
      phone: "210-555-1003",
      roles: ["CONTRACTOR"],
      activeRole: "CONTRACTOR",
      emailVerified: true,
      contractor: {
        create: {
          company: "Garcia Plumbing Services",
          bio: "Licensed master plumber serving the San Antonio area for over 20 years. From pipe repairs to full bathroom remodels, we do it right the first time.",
          specialty: "Plumbing",
          skills: ["Pipe Repair", "Bathroom Remodels", "Water Heaters", "Sewer Lines"],
          location: "Hattiesburg, MS",
          serviceRadius: 60,
          yearsExperience: 20,
          hourlyRate: 90,
          verified: true,
          licensed: true,
          insured: true,
          fairTradePromise: true,
          rating: 4.7,
          reviewCount: 203,
          jobsCompleted: 512,
        },
      },
    },
  });

  // Dual-role contractor (also a subcontractor)
  const contractor4User = await prisma.user.create({
    data: {
      email: "james.mitchell@example.com",
      passwordHash: password,
      name: "James Mitchell",
      phone: "713-555-1004",
      roles: ["CONTRACTOR", "SUBCONTRACTOR"],
      activeRole: "CONTRACTOR",
      emailVerified: true,
      contractor: {
        create: {
          company: "Mitchell Roofing Co.",
          bio: "Full-service roofing contractor specializing in storm damage repair, metal roofing, and complete roof replacements. Hail damage experts.",
          specialty: "Roofing",
          skills: ["Metal Roofing", "Shingle Replacement", "Storm Damage", "Inspections"],
          location: "Jackson, MS",
          serviceRadius: 75,
          yearsExperience: 18,
          hourlyRate: 75,
          verified: true,
          licensed: true,
          insured: true,
          fairTradePromise: true,
          rating: 4.9,
          reviewCount: 156,
          jobsCompleted: 428,
        },
      },
      subContractor: {
        create: {
          company: "Mitchell Roofing Co.",
          bio: "Available for roofing sub-work on larger projects.",
          specialty: "Roofing",
          skills: ["Metal Roofing", "Shingle Replacement", "Storm Damage"],
          location: "Jackson, MS",
          serviceRadius: 75,
          yearsExperience: 18,
          hourlyRate: 65,
          verified: true,
          licensed: true,
          insured: true,
          rating: 4.9,
          reviewCount: 42,
          subJobsCompleted: 87,
        },
      },
    },
  });

  // ── Subcontractors ──────────────────────────────────────────────
  const sub1User = await prisma.user.create({
    data: {
      email: "tony.alvarez@example.com",
      passwordHash: password,
      name: "Tony Alvarez",
      phone: "512-555-2001",
      roles: ["SUBCONTRACTOR"],
      activeRole: "SUBCONTRACTOR",
      emailVerified: true,
      subContractor: {
        create: {
          company: "Alvarez Drywall & Tape",
          bio: "Drywall hanging and finishing for residential and commercial. Clean work, fast turnaround.",
          specialty: "Drywall",
          skills: ["Hanging", "Taping", "Texturing", "Patching"],
          location: "Oxford, MS",
          serviceRadius: 30,
          yearsExperience: 10,
          hourlyRate: 55,
          verified: true,
          licensed: true,
          insured: true,
          rating: 4.7,
          reviewCount: 38,
          subJobsCompleted: 145,
        },
      },
    },
  });

  const sub2User = await prisma.user.create({
    data: {
      email: "kendra.wells@example.com",
      passwordHash: password,
      name: "Kendra Wells",
      phone: "214-555-2002",
      roles: ["SUBCONTRACTOR"],
      activeRole: "SUBCONTRACTOR",
      emailVerified: true,
      subContractor: {
        create: {
          company: "Wells Tile & Stone",
          bio: "Custom tile installation — backsplashes, showers, floors. Precision cuts and clean grout lines.",
          specialty: "Tile",
          skills: ["Tile Installation", "Backsplash", "Shower Tile", "Floor Tile"],
          location: "Tupelo, MS",
          serviceRadius: 35,
          yearsExperience: 7,
          hourlyRate: 60,
          verified: true,
          licensed: true,
          insured: true,
          rating: 4.8,
          reviewCount: 52,
          subJobsCompleted: 98,
        },
      },
    },
  });

  // ── Fetch created profile records ───────────────────────────────
  const homeowner1 = await prisma.homeowner.findUnique({ where: { userId: homeowner1User.id } });
  const homeowner2 = await prisma.homeowner.findUnique({ where: { userId: homeowner2User.id } });
  const homeowner3 = await prisma.homeowner.findUnique({ where: { userId: homeowner3User.id } });
  const contractor1 = await prisma.contractor.findUnique({ where: { userId: contractor1User.id } });
  const contractor2 = await prisma.contractor.findUnique({ where: { userId: contractor2User.id } });
  const contractor3 = await prisma.contractor.findUnique({ where: { userId: contractor3User.id } });
  const contractor4 = await prisma.contractor.findUnique({ where: { userId: contractor4User.id } });

  // ── Jobs ────────────────────────────────────────────────────────
  const job1 = await prisma.job.create({
    data: {
      homeownerId: homeowner1!.id,
      title: "Kitchen Remodel — Full Gut and Rebuild",
      description: "Complete kitchen remodel including new cabinets, countertops, flooring, lighting, and appliances. Removing a load-bearing wall to open to the living room.",
      detailedScope: "Demo existing kitchen to studs. Install new LVL beam for wall removal. New electrical for island, under-cabinet lighting. Plumbing relocated for new sink position. Custom shaker cabinets, quartz countertops, LVP flooring.",
      category: "Remodeling",
      subcategory: "Kitchen",
      budgetMin: 35000,
      budgetMax: 55000,
      location: "Oxford, MS",
      fullAddress: "4821 Balcones Dr, Oxford, MS 78731",
      status: "OPEN",
      urgency: "MEDIUM",
      propertyType: "RESIDENTIAL",
      sqft: 2400,
      yearBuilt: 1998,
      deadline: new Date("2026-06-15"),
      preferredStartDate: new Date("2026-04-15"),
      estimatedDuration: "8-10 weeks",
      accessNotes: "Gate code 4455. Ring doorbell on arrival.",
      permitsRequired: true,
      inspectionRequired: true,
      tags: ["kitchen", "remodel", "load-bearing wall", "cabinets", "countertops"],
      specialInstructions: "Family has two dogs — please keep gates closed at all times.",
    },
  });

  const job2 = await prisma.job.create({
    data: {
      homeownerId: homeowner2!.id,
      title: "Electrical Panel Upgrade — 200 Amp",
      description: "Upgrade main electrical panel from 100A to 200A. Need capacity for EV charger, workshop, and future solar.",
      detailedScope: "Replace 100A main panel with 200A. New meter base. Run dedicated 50A circuit for EV charger in garage. Add two 20A circuits for workshop. Bring all existing wiring to code.",
      category: "Electrical",
      subcategory: "Panel Upgrade",
      budgetMin: 3500,
      budgetMax: 6000,
      location: "Tupelo, MS",
      fullAddress: "1127 Mockingbird Ln, Tupelo, MS 75205",
      status: "OPEN",
      urgency: "HIGH",
      propertyType: "RESIDENTIAL",
      sqft: 1800,
      yearBuilt: 1972,
      deadline: new Date("2026-05-01"),
      preferredStartDate: new Date("2026-04-07"),
      estimatedDuration: "2-3 days",
      permitsRequired: true,
      inspectionRequired: true,
      tags: ["electrical", "panel upgrade", "200 amp", "ev charger"],
    },
  });

  const job3 = await prisma.job.create({
    data: {
      homeownerId: homeowner3!.id,
      title: "Master Bathroom Remodel",
      description: "Gut and remodel master bathroom. Walk-in shower with frameless glass, double vanity, heated floors.",
      detailedScope: "Demo to studs. New PEX plumbing. Heated floor mat under tile. Walk-in shower with linear drain and frameless glass enclosure. Double vanity with quartz top. New exhaust fan vented to exterior.",
      category: "Remodeling",
      subcategory: "Bathroom",
      budgetMin: 18000,
      budgetMax: 28000,
      location: "Hattiesburg, MS",
      fullAddress: "903 King William St, Hattiesburg, MS 78204",
      status: "IN_PROGRESS",
      urgency: "LOW",
      propertyType: "RESIDENTIAL",
      sqft: 3200,
      yearBuilt: 1925,
      deadline: new Date("2026-07-01"),
      preferredStartDate: new Date("2026-04-01"),
      estimatedDuration: "5-6 weeks",
      accessNotes: "Historic district — check with HOA before exterior changes.",
      permitsRequired: true,
      tags: ["bathroom", "remodel", "walk-in shower", "heated floors"],
    },
  });

  const job4 = await prisma.job.create({
    data: {
      homeownerId: homeowner1!.id,
      title: "Fence Replacement — 180 Linear Feet",
      description: "Replace entire backyard cedar fence. Posts are rotting at ground level. Need 6ft privacy fence.",
      category: "Fencing",
      budgetMin: 4500,
      budgetMax: 7000,
      location: "Oxford, MS",
      fullAddress: "4821 Balcones Dr, Oxford, MS 78731",
      status: "OPEN",
      urgency: "MEDIUM",
      propertyType: "RESIDENTIAL",
      sqft: 2400,
      yearBuilt: 1998,
      estimatedDuration: "3-5 days",
      tags: ["fence", "cedar", "privacy fence", "replacement"],
    },
  });

  const job5 = await prisma.job.create({
    data: {
      homeownerId: homeowner2!.id,
      title: "Roof Replacement — Hail Damage",
      description: "Full roof replacement after hail damage. Insurance claim approved. Need GAF certified installer.",
      category: "Roofing",
      budgetMin: 12000,
      budgetMax: 18000,
      location: "Tupelo, MS",
      fullAddress: "1127 Mockingbird Ln, Tupelo, MS 75205",
      status: "OPEN",
      urgency: "HIGH",
      propertyType: "RESIDENTIAL",
      sqft: 1800,
      yearBuilt: 1972,
      deadline: new Date("2026-05-15"),
      estimatedDuration: "2-3 days",
      insuranceClaim: true,
      permitsRequired: true,
      tags: ["roofing", "hail damage", "insurance", "GAF"],
    },
  });

  // ── Bids ────────────────────────────────────────────────────────
  await prisma.bid.create({
    data: {
      jobId: job1.id,
      contractorId: contractor1!.id,
      amount: 42500,
      message: "We've done dozens of kitchen remodels in the Balcones area. I can handle the structural beam work in-house. Happy to walk through the space and refine scope.",
      timeline: "9 weeks from permit approval",
      status: "PENDING",
    },
  });

  await prisma.bid.create({
    data: {
      jobId: job2.id,
      contractorId: contractor2!.id,
      amount: 4800,
      message: "Panel upgrade is straightforward. I'll pull the permit, coordinate with the utility for the meter swap, and have you at 200A within the week.",
      timeline: "2 days plus utility coordination",
      status: "PENDING",
    },
  });

  const acceptedBid = await prisma.bid.create({
    data: {
      jobId: job3.id,
      contractorId: contractor3!.id,
      amount: 24500,
      message: "Beautiful home — I've worked on several King William properties. We'll be careful with the historic elements. Price includes all materials and fixtures discussed.",
      timeline: "6 weeks",
      status: "ACCEPTED",
    },
  });

  await prisma.bid.create({
    data: {
      jobId: job5.id,
      contractorId: contractor4!.id,
      amount: 14200,
      message: "GAF Master Elite certified. We handle insurance jobs weekly — I'll work directly with your adjuster. Can start next week.",
      timeline: "2 days once materials arrive",
      status: "PENDING",
    },
  });

  // ── SubJobs (from contractor1's kitchen remodel) ────────────────
  const subJob1 = await prisma.subJob.create({
    data: {
      contractorId: contractor1!.id,
      projectId: job1.id,
      milestoneLabel: "Drywall & Tape",
      milestoneIndex: 3,
      title: "Hang and finish drywall after framing",
      description: "Hang, tape, mud, and sand all new drywall in kitchen area after structural beam and framing is complete. Approximately 450 sq ft of wall and ceiling.",
      category: "Drywall",
      skills: ["Hanging", "Taping", "Texturing"],
      location: "Oxford, MS",
      budgetMin: 2800,
      budgetMax: 4200,
      paymentPath: "CONTRACTOR_ESCROW",
      status: "OPEN",
      deadline: new Date("2026-05-15"),
    },
  });

  const subJob2 = await prisma.subJob.create({
    data: {
      contractorId: contractor1!.id,
      projectId: job1.id,
      milestoneLabel: "Tile Installation",
      milestoneIndex: 5,
      title: "Kitchen backsplash and floor tile",
      description: "Install subway tile backsplash and LVP-to-tile transition at kitchen entry. Approximately 35 sq ft backsplash, 120 sq ft floor tile.",
      category: "Tile",
      skills: ["Tile Installation", "Backsplash", "Floor Tile"],
      location: "Oxford, MS",
      budgetMin: 3500,
      budgetMax: 5500,
      paymentPath: "CONTRACTOR_ESCROW",
      status: "OPEN",
      deadline: new Date("2026-06-01"),
    },
  });

  // ── SubBids ─────────────────────────────────────────────────────
  const sub1Record = await prisma.subContractor.findUnique({ where: { userId: sub1User.id } });
  const sub2Record = await prisma.subContractor.findUnique({ where: { userId: sub2User.id } });

  await prisma.subBid.create({
    data: {
      subJobId: subJob1.id,
      subContractorId: sub1Record!.id,
      amount: 3400,
      message: "Can start as soon as framing inspection passes. I'll bring my own lift for the ceiling work.",
      timeline: "4 days",
      status: "PENDING",
    },
  });

  await prisma.subBid.create({
    data: {
      subJobId: subJob2.id,
      subContractorId: sub2Record!.id,
      amount: 4200,
      message: "I do clean grout lines and precise cuts around outlets. Materials price not included — happy to source or use what you provide.",
      timeline: "5 days",
      status: "PENDING",
    },
  });

  // ── Licenses ────────────────────────────────────────────────────
  await prisma.license.createMany({
    data: [
      {
        contractorId: contractor1!.id,
        licenseNumber: "TX-GC-2019-44821",
        state: "TX",
        type: "General Contractor",
        expirationDate: new Date("2027-03-15"),
        verified: true,
        verifiedAt: new Date("2026-01-10"),
      },
      {
        contractorId: contractor2!.id,
        licenseNumber: "TX-ME-2014-31209",
        state: "TX",
        type: "Master Electrician",
        expirationDate: new Date("2027-06-30"),
        verified: true,
        verifiedAt: new Date("2026-02-01"),
      },
      {
        contractorId: contractor3!.id,
        licenseNumber: "TX-MP-2006-18773",
        state: "TX",
        type: "Master Plumber",
        expirationDate: new Date("2027-09-01"),
        verified: true,
        verifiedAt: new Date("2025-12-15"),
      },
      {
        contractorId: contractor4!.id,
        licenseNumber: "TX-RF-2012-27654",
        state: "TX",
        type: "Roofing Contractor",
        expirationDate: new Date("2027-01-31"),
        verified: true,
        verifiedAt: new Date("2026-01-05"),
      },
    ],
  });

  // ── Insurance ───────────────────────────────────────────────────
  await prisma.insuranceCert.createMany({
    data: [
      {
        contractorId: contractor1!.id,
        provider: "State Farm",
        policyNumber: "SF-TX-GL-442918",
        coverageType: "General Liability",
        coverageAmount: 2000000,
        expirationDate: new Date("2027-01-01"),
        verified: true,
      },
      {
        contractorId: contractor2!.id,
        provider: "Hartford",
        policyNumber: "HF-TX-GL-331205",
        coverageType: "General Liability",
        coverageAmount: 1000000,
        expirationDate: new Date("2026-12-15"),
        verified: true,
      },
      {
        contractorId: contractor3!.id,
        provider: "Travelers",
        policyNumber: "TV-TX-GL-559102",
        coverageType: "General Liability",
        coverageAmount: 2000000,
        expirationDate: new Date("2027-03-01"),
        verified: true,
      },
    ],
  });

  // ── Reviews (on the accepted bathroom job) ──────────────────────
  await prisma.review.createMany({
    data: [
      {
        contractorId: contractor3!.id,
        authorHomeownerId: homeowner3!.id,
        rating: 5,
        text: "Robert and his crew were outstanding. They respected the historic character of our home while delivering a modern bathroom. On time and on budget.",
      },
      {
        contractorId: contractor1!.id,
        authorHomeownerId: homeowner1!.id,
        rating: 5,
        text: "Marcus is the real deal. Professional, communicative, and his finish carpentry work is top notch. Would hire again without hesitation.",
      },
      {
        contractorId: contractor1!.id,
        authorHomeownerId: homeowner2!.id,
        rating: 4,
        text: "Good work overall. Project ran about a week over schedule but the quality was excellent. Marcus kept us informed throughout.",
      },
    ],
  });

  // ── AI Estimates ────────────────────────────────────────────────
  await prisma.aiEstimate.create({
    data: {
      jobId: job1.id,
      estimateNumber: "FTW-AI-2026-0001",
      estimateMin: 38500,
      estimateMax: 52000,
      estimateMid: 45250,
      confidence: 0.82,
      laborHours: 320,
      laborCost: 19200,
      materialCost: 18500,
      equipmentCost: 1200,
      subtotal: 38900,
      overheadPercent: 0.12,
      profitPercent: 0.15,
      contingencyPct: 0.08,
      total: 48200,
      exclusions: ["Appliances", "Permit fees", "Asbestos abatement if found"],
      notes: ["Load-bearing wall removal requires structural engineer sign-off", "Lead paint testing recommended for pre-2000 homes"],
      timelineWeeks: 9,
      modelVersion: "constructionai-v4",
      regionFactor: 1.05,
      lineItems: [
        { division: "01", description: "General Conditions", cost: 3200 },
        { division: "02", description: "Demolition", cost: 2800 },
        { division: "06", description: "Structural — LVL Beam + Framing", cost: 5400 },
        { division: "09", description: "Drywall & Finishing", cost: 3600 },
        { division: "09", description: "Tile & Backsplash", cost: 4200 },
        { division: "12", description: "Cabinets & Countertops", cost: 14500 },
        { division: "15", description: "Plumbing Rough + Finish", cost: 3800 },
        { division: "16", description: "Electrical Rough + Finish", cost: 2900 },
        { division: "09", description: "Painting & Trim", cost: 1800 },
      ],
    },
  });

  // ── Notifications ───────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: homeowner1User.id,
        type: "bid_received",
        title: "New bid on Kitchen Remodel",
        body: "Marcus Johnson from Johnson & Sons Construction bid $42,500 on your kitchen remodel.",
        data: { jobId: job1.id },
      },
      {
        userId: contractor1User.id,
        type: "job_posted",
        title: "New job matching your skills",
        body: "Kitchen Remodel — Full Gut and Rebuild in Oxford, MS. Budget: $35K-$55K.",
        data: { jobId: job1.id },
      },
      {
        userId: contractor3User.id,
        type: "bid_accepted",
        title: "Your bid was accepted",
        body: "Rachel Turner accepted your $24,500 bid for the Master Bathroom Remodel.",
        data: { jobId: job3.id, bidId: acceptedBid.id },
      },
      {
        userId: sub1User.id,
        type: "sub_job_posted",
        title: "New sub-job in your area",
        body: "Drywall & tape work needed for a kitchen remodel in Oxford, MS. Budget: $2,800-$4,200.",
        data: { subJobId: subJob1.id },
      },
    ],
  });

  // ── Conversations ───────────────────────────────────────────────
  const convo = await prisma.conversation.create({
    data: {
      jobId: job3.id,
      participants: {
        create: [
          { contractorId: contractor3!.id },
          { homeownerId: homeowner3!.id },
        ],
      },
      messages: {
        create: [
          {
            senderId: homeowner3User.id,
            content: "Hi Robert, excited to get started on the bathroom. When can you come by for the initial walkthrough?",
          },
          {
            senderId: contractor3User.id,
            content: "Hey Rachel! I can come by Thursday morning around 9am if that works. I want to check the subfloor condition before we finalize the heated floor layout.",
          },
          {
            senderId: homeowner3User.id,
            content: "Thursday at 9 works perfectly. I'll have the tile samples ready for you to look at too.",
          },
        ],
      },
    },
  });

  const counts = {
    users: await prisma.user.count(),
    contractors: await prisma.contractor.count(),
    homeowners: await prisma.homeowner.count(),
    subContractors: await prisma.subContractor.count(),
    jobs: await prisma.job.count(),
    bids: await prisma.bid.count(),
    subJobs: await prisma.subJob.count(),
    subBids: await prisma.subBid.count(),
    licenses: await prisma.license.count(),
    reviews: await prisma.review.count(),
    notifications: await prisma.notification.count(),
    conversations: await prisma.conversation.count(),
  };

  console.log("\nSeed complete:");
  for (const [table, count] of Object.entries(counts)) {
    console.log(`  ${table}: ${count}`);
  }
  console.log("\nAll demo accounts use password: demo1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
