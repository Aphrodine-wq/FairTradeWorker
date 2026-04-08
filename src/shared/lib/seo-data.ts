// SEO data powering /services/[trade]/[location] landing pages
// Mississippi-first strategy — every trade + city combo is an indexable page

export interface SubService {
  name: string;
  slug: string;
  description: string;
  costRange: string;
}

export interface Trade {
  name: string;
  slug: string;
  plural: string;
  description: string;
  keywords: string[];
  faqs: { question: string; answer: string }[];
  avgCostRange: string;
  commonProjects: string[];
  subServices: SubService[];
}

export interface Neighborhood {
  name: string;
  slug: string;
  description: string;
}

export interface CityProfile {
  slug: string;
  tagline: string;
  description: string;
  population: string;
  highlights: string[];
  neighborhoods: Neighborhood[];
  localFaqs: { question: string; answer: string }[];
  seasonalTips: { season: string; title: string; description: string }[];
  nearbyLandmarks: string[];
}

export interface ServiceLocation {
  city: string;
  state: string;
  stateAbbr: string;
  slug: string;
  metro?: string;
  profile?: CityProfile;
}

export const TRADES: Trade[] = [
  {
    name: "HVAC",
    slug: "hvac",
    plural: "HVAC Contractors",
    description:
      "Heating, ventilation, and air conditioning installation, repair, and maintenance from verified HVAC professionals.",
    keywords: [
      "hvac contractor", "hvac repair", "ac installation", "heating repair",
      "furnace installation", "air conditioning", "hvac service", "ductwork",
      "hvac maintenance", "central air",
    ],
    faqs: [
      {
        question: "How much does HVAC installation cost?",
        answer:
          "HVAC installation typically costs between $5,000 and $12,500 depending on system size, brand, and home layout. FairTradeWorker contractors provide detailed AI-powered estimates so you know the real cost before work begins.",
      },
      {
        question: "How do I find a reliable HVAC contractor?",
        answer:
          "On FairTradeWorker, every HVAC contractor is license-verified, insured, and reviewed by real homeowners. Post your job for free, receive competitive bids, and compare contractors side-by-side before hiring.",
      },
      {
        question: "How often should HVAC systems be serviced?",
        answer:
          "HVAC systems should be professionally serviced twice a year — once before cooling season and once before heating season. Regular maintenance extends system life by 5-10 years and cuts energy costs by up to 25%.",
      },
    ],
    avgCostRange: "$150 - $12,500",
    commonProjects: [
      "AC installation", "Furnace replacement", "Ductwork repair",
      "Heat pump installation", "Thermostat upgrade", "HVAC maintenance",
    ],
    subServices: [
      { name: "AC Repair", slug: "ac-repair", description: "Air conditioning repair and troubleshooting for all makes and models.", costRange: "$150 - $1,200" },
      { name: "AC Installation", slug: "ac-installation", description: "New central air conditioning system installation and replacement.", costRange: "$3,500 - $7,500" },
      { name: "Furnace Repair", slug: "furnace-repair", description: "Gas and electric furnace diagnosis, repair, and maintenance.", costRange: "$150 - $1,000" },
      { name: "Furnace Installation", slug: "furnace-installation", description: "New furnace installation and old unit removal.", costRange: "$2,500 - $6,500" },
      { name: "Heat Pump Installation", slug: "heat-pump-installation", description: "Energy-efficient heat pump installation for heating and cooling.", costRange: "$4,000 - $8,000" },
      { name: "Ductwork Repair", slug: "ductwork-repair", description: "Duct sealing, repair, and replacement for better airflow and efficiency.", costRange: "$500 - $2,000" },
      { name: "HVAC Maintenance", slug: "hvac-maintenance", description: "Seasonal tune-ups, filter replacement, and preventive maintenance.", costRange: "$75 - $200" },
      { name: "Thermostat Installation", slug: "thermostat-installation", description: "Smart thermostat and programmable thermostat installation.", costRange: "$150 - $500" },
    ],
  },
  {
    name: "Electrical",
    slug: "electricians",
    plural: "Electricians",
    description:
      "Licensed electricians for residential and commercial wiring, panel upgrades, outlet installation, and electrical repairs.",
    keywords: [
      "electrician", "electrical contractor", "electrical repair", "panel upgrade",
      "outlet installation", "wiring", "electrical service", "licensed electrician",
      "rewiring", "ev charger installation",
    ],
    faqs: [
      {
        question: "How much does an electrician cost per hour?",
        answer:
          "Electricians typically charge $50 to $130 per hour depending on the complexity of work and your location. FairTradeWorker provides upfront project-based estimates instead of hourly surprises.",
      },
      {
        question: "Do I need a licensed electrician?",
        answer:
          "Yes — electrical work requires a licensed professional in most states. All electricians on FairTradeWorker are license-verified before they can bid on jobs, so you never have to guess.",
      },
      {
        question: "How long does a panel upgrade take?",
        answer:
          "A standard electrical panel upgrade takes 4-8 hours for a licensed electrician. Upgrading from 100 to 200 amps typically costs $1,500 to $3,000 including permits.",
      },
    ],
    avgCostRange: "$150 - $5,000",
    commonProjects: [
      "Panel upgrade", "Outlet installation", "Whole-house rewiring",
      "EV charger installation", "Lighting installation", "Generator hookup",
    ],
    subServices: [
      { name: "Electrical Panel Upgrade", slug: "panel-upgrade", description: "Upgrade from 100 to 200 amp service for modern electrical demands.", costRange: "$1,500 - $3,000" },
      { name: "Outlet Installation", slug: "outlet-installation", description: "New outlet installation, GFCI outlets, and USB outlet upgrades.", costRange: "$150 - $400" },
      { name: "Whole-House Rewiring", slug: "rewiring", description: "Complete home rewiring for safety and code compliance.", costRange: "$3,500 - $8,000" },
      { name: "EV Charger Installation", slug: "ev-charger-installation", description: "Level 2 electric vehicle charger installation in your garage or driveway.", costRange: "$500 - $2,000" },
      { name: "Lighting Installation", slug: "lighting-installation", description: "Recessed lighting, ceiling fans, and fixture installation.", costRange: "$150 - $1,500" },
      { name: "Generator Installation", slug: "generator-installation", description: "Whole-home standby generator installation and transfer switch wiring.", costRange: "$3,000 - $6,000" },
      { name: "Electrical Repair", slug: "electrical-repair", description: "Troubleshooting and repair for circuits, switches, and wiring issues.", costRange: "$100 - $500" },
      { name: "Ceiling Fan Installation", slug: "ceiling-fan-installation", description: "Ceiling fan installation and replacement with proper wiring.", costRange: "$150 - $350" },
    ],
  },
  {
    name: "Plumbing",
    slug: "plumbers",
    plural: "Plumbers",
    description:
      "Licensed plumbers for pipe repair, water heater installation, drain cleaning, fixture installation, and emergency plumbing services.",
    keywords: [
      "plumber", "plumbing contractor", "pipe repair", "water heater installation",
      "drain cleaning", "plumbing service", "leak repair", "sewer line",
      "toilet installation", "faucet repair",
    ],
    faqs: [
      {
        question: "How much does a plumber charge?",
        answer:
          "Plumbers typically charge $75 to $150 per hour, with most jobs running $200 to $1,500 for common repairs. FairTradeWorker contractors provide project-based estimates upfront — no surprise hourly bills.",
      },
      {
        question: "How do I find a good plumber near me?",
        answer:
          "Post your plumbing job on FairTradeWorker for free. You'll receive bids from verified, licensed plumbers in your area. Compare prices, reviews, and qualifications before hiring anyone.",
      },
      {
        question: "How long does water heater installation take?",
        answer:
          "A standard water heater replacement takes 2-4 hours. Switching from tank to tankless may take a full day due to additional plumbing and gas line work. Typical cost: $1,000 to $3,500.",
      },
    ],
    avgCostRange: "$200 - $5,000",
    commonProjects: [
      "Water heater replacement", "Drain cleaning", "Pipe repair",
      "Fixture installation", "Sewer line repair", "Bathroom rough-in",
    ],
    subServices: [
      { name: "Water Heater Installation", slug: "water-heater-installation", description: "Tank and tankless water heater installation and replacement.", costRange: "$1,000 - $3,500" },
      { name: "Drain Cleaning", slug: "drain-cleaning", description: "Clogged drain clearing, hydro jetting, and sewer line cleaning.", costRange: "$100 - $500" },
      { name: "Leak Repair", slug: "leak-repair", description: "Water leak detection and pipe repair for residential and commercial properties.", costRange: "$150 - $800" },
      { name: "Toilet Repair", slug: "toilet-repair", description: "Toilet installation, replacement, and repair services.", costRange: "$150 - $500" },
      { name: "Sewer Line Repair", slug: "sewer-line-repair", description: "Sewer line inspection, repair, and replacement.", costRange: "$1,000 - $5,000" },
      { name: "Faucet Installation", slug: "faucet-installation", description: "Kitchen and bathroom faucet installation and replacement.", costRange: "$150 - $400" },
      { name: "Pipe Repair", slug: "pipe-repair", description: "Burst pipe repair, pipe replacement, and repiping services.", costRange: "$200 - $2,000" },
      { name: "Gas Line Installation", slug: "gas-line-installation", description: "Natural gas line installation and repair for appliances and grills.", costRange: "$300 - $1,500" },
    ],
  },
  {
    name: "Roofing",
    slug: "roofers",
    plural: "Roofers",
    description:
      "Verified roofing contractors for roof replacement, repair, inspection, and installation of shingles, metal, tile, and flat roofing systems.",
    keywords: [
      "roofer", "roofing contractor", "roof replacement", "roof repair",
      "shingle roof", "metal roof", "roof inspection", "roofing company",
      "roof leak repair", "roof installation",
    ],
    faqs: [
      {
        question: "How much does a new roof cost?",
        answer:
          "A new roof costs $5,000 to $15,000 for asphalt shingles on an average home, and $15,000 to $30,000+ for metal roofing. FairTradeWorker's AI-powered estimates break down exact material and labor costs for your specific roof.",
      },
      {
        question: "How do I know if I need a new roof?",
        answer:
          "Common signs include missing or curling shingles, granules in gutters, daylight through the attic, and a roof over 20 years old. Post a roof inspection job on FairTradeWorker and get a professional assessment.",
      },
      {
        question: "How long does roof replacement take?",
        answer:
          "Most residential roof replacements take 1-3 days depending on size, materials, and weather. Metal roofs and complex designs may take up to a week.",
      },
    ],
    avgCostRange: "$300 - $30,000",
    commonProjects: [
      "Full roof replacement", "Roof repair", "Roof inspection",
      "Gutter installation", "Skylight installation", "Storm damage repair",
    ],
    subServices: [
      { name: "Roof Replacement", slug: "roof-replacement", description: "Complete roof tear-off and replacement with new materials.", costRange: "$5,000 - $15,000" },
      { name: "Roof Repair", slug: "roof-repair", description: "Leak repair, shingle replacement, and storm damage fixes.", costRange: "$300 - $1,500" },
      { name: "Metal Roofing", slug: "metal-roofing", description: "Standing seam and corrugated metal roof installation.", costRange: "$10,000 - $30,000" },
      { name: "Roof Inspection", slug: "roof-inspection", description: "Professional roof inspection for buying, selling, or insurance claims.", costRange: "$150 - $400" },
      { name: "Gutter Installation", slug: "gutter-installation", description: "Seamless gutter installation, repair, and gutter guard systems.", costRange: "$600 - $2,500" },
      { name: "Storm Damage Repair", slug: "storm-damage-repair", description: "Emergency roof repair after storms, hail, and wind damage.", costRange: "$500 - $5,000" },
      { name: "Roof Leak Repair", slug: "roof-leak-repair", description: "Locate and fix active roof leaks before they cause interior damage.", costRange: "$300 - $1,000" },
    ],
  },
  {
    name: "Painting",
    slug: "painters",
    plural: "Painters",
    description:
      "Professional painters for interior and exterior house painting, cabinet refinishing, deck staining, and commercial painting services.",
    keywords: [
      "painter", "painting contractor", "house painting", "interior painting",
      "exterior painting", "cabinet painting", "deck staining", "commercial painting",
      "paint contractor", "house painter",
    ],
    faqs: [
      {
        question: "How much does it cost to paint a house?",
        answer:
          "Interior painting costs $2 to $6 per square foot. Exterior painting costs $1.50 to $4 per square foot. A full interior paint job on a 2,000 sq ft home typically runs $3,000 to $8,000.",
      },
      {
        question: "How long does it take to paint a house?",
        answer:
          "Interior painting of a 2,000 sq ft home takes 3-5 days. Exterior painting takes 3-7 days depending on prep work, weather, and home size.",
      },
      {
        question: "Should I hire a painter or DIY?",
        answer:
          "Professional painters deliver cleaner lines, better prep, and longer-lasting results. On FairTradeWorker, you can compare bids from verified painters — most homeowners find pro pricing competitive when factoring in time, equipment, and quality.",
      },
    ],
    avgCostRange: "$500 - $10,000",
    commonProjects: [
      "Interior painting", "Exterior painting", "Cabinet refinishing",
      "Deck staining", "Trim painting", "Wallpaper removal",
    ],
    subServices: [
      { name: "Interior Painting", slug: "interior-painting", description: "Professional interior house painting for rooms, ceilings, and trim.", costRange: "$1,500 - $5,000" },
      { name: "Exterior Painting", slug: "exterior-painting", description: "Exterior house painting including prep, priming, and finish coats.", costRange: "$2,000 - $8,000" },
      { name: "Cabinet Painting", slug: "cabinet-painting", description: "Kitchen and bathroom cabinet refinishing and painting.", costRange: "$1,200 - $5,000" },
      { name: "Deck Staining", slug: "deck-staining", description: "Deck staining, sealing, and refinishing for wood decks.", costRange: "$500 - $1,500" },
      { name: "Pressure Washing", slug: "pressure-washing", description: "House, driveway, deck, and patio pressure washing services.", costRange: "$150 - $500" },
      { name: "Popcorn Ceiling Removal", slug: "popcorn-ceiling-removal", description: "Textured ceiling removal and smooth finish application.", costRange: "$1,000 - $3,000" },
    ],
  },
  {
    name: "Flooring",
    slug: "flooring",
    plural: "Flooring Contractors",
    description:
      "Expert flooring installers for hardwood, tile, laminate, vinyl, and carpet installation, refinishing, and repair.",
    keywords: [
      "flooring contractor", "hardwood flooring", "tile installation", "laminate flooring",
      "vinyl flooring", "carpet installation", "floor refinishing", "flooring installer",
      "floor repair", "flooring company",
    ],
    faqs: [
      {
        question: "How much does new flooring cost?",
        answer:
          "Flooring costs range from $3-$5/sqft for laminate, $6-$12/sqft for hardwood, $5-$10/sqft for tile, and $2-$4/sqft for vinyl plank. Installation labor adds $2-$8/sqft depending on material.",
      },
      {
        question: "What is the most durable flooring?",
        answer:
          "Porcelain tile and luxury vinyl plank (LVP) are the most durable residential options. Hardwood is durable and refinishable. Post your project on FairTradeWorker and get expert recommendations from verified flooring contractors.",
      },
      {
        question: "How long does flooring installation take?",
        answer:
          "A 1,000 sqft flooring installation typically takes 2-4 days for hardwood or tile, and 1-2 days for laminate or vinyl plank.",
      },
    ],
    avgCostRange: "$1,000 - $15,000",
    commonProjects: [
      "Hardwood installation", "Tile installation", "Laminate flooring",
      "Vinyl plank flooring", "Carpet installation", "Floor refinishing",
    ],
    subServices: [
      { name: "Hardwood Floor Installation", slug: "hardwood-installation", description: "Solid and engineered hardwood floor installation.", costRange: "$3,000 - $10,000" },
      { name: "Tile Installation", slug: "tile-installation", description: "Ceramic, porcelain, and natural stone tile installation.", costRange: "$1,500 - $6,000" },
      { name: "Laminate Flooring", slug: "laminate-flooring", description: "Laminate floor installation for a durable, affordable finish.", costRange: "$1,000 - $4,000" },
      { name: "Vinyl Plank Flooring", slug: "vinyl-plank-flooring", description: "Luxury vinyl plank (LVP) installation — waterproof and durable.", costRange: "$1,200 - $5,000" },
      { name: "Carpet Installation", slug: "carpet-installation", description: "Carpet installation and replacement for bedrooms and living areas.", costRange: "$800 - $3,000" },
      { name: "Hardwood Refinishing", slug: "hardwood-refinishing", description: "Sand, stain, and refinish existing hardwood floors.", costRange: "$1,500 - $4,000" },
    ],
  },
  {
    name: "Landscaping",
    slug: "landscapers",
    plural: "Landscapers",
    description:
      "Professional landscaping services including lawn care, hardscaping, irrigation, tree service, and outdoor living space design.",
    keywords: [
      "landscaper", "landscaping company", "lawn care", "hardscaping",
      "irrigation", "tree service", "landscape design", "yard work",
      "sod installation", "patio installation",
    ],
    faqs: [
      {
        question: "How much does landscaping cost?",
        answer:
          "Basic landscaping starts at $500-$3,000 for plantings and mulch. Hardscaping (patios, retaining walls) runs $3,000-$15,000+. Full landscape redesigns cost $5,000-$25,000 depending on scope.",
      },
      {
        question: "What landscaping adds the most home value?",
        answer:
          "Well-maintained lawns, mature trees, and hardscaped patios add the most value — typically 5-15% of home value. A verified landscaper on FairTradeWorker can advise on the best ROI projects for your property.",
      },
      {
        question: "When is the best time to start a landscaping project?",
        answer:
          "Spring and fall are ideal for most landscaping work. Hardscaping can be done year-round in mild climates. Post your project on FairTradeWorker to get bids from local landscapers who know your climate.",
      },
    ],
    avgCostRange: "$500 - $25,000",
    commonProjects: [
      "Lawn installation", "Patio design", "Retaining walls",
      "Irrigation systems", "Tree removal", "Outdoor lighting",
    ],
    subServices: [
      { name: "Lawn Care", slug: "lawn-care", description: "Mowing, fertilization, weed control, and seasonal lawn maintenance.", costRange: "$50 - $200/visit" },
      { name: "Tree Removal", slug: "tree-removal", description: "Safe tree removal, stump grinding, and debris cleanup.", costRange: "$500 - $3,000" },
      { name: "Tree Trimming", slug: "tree-trimming", description: "Professional tree pruning and trimming for health and appearance.", costRange: "$200 - $1,000" },
      { name: "Sod Installation", slug: "sod-installation", description: "New lawn installation with fresh sod and soil prep.", costRange: "$1,000 - $4,000" },
      { name: "Irrigation Installation", slug: "irrigation-installation", description: "Sprinkler system installation, repair, and winterization.", costRange: "$1,500 - $4,000" },
      { name: "Patio Installation", slug: "patio-installation", description: "Paver and stone patio design and installation.", costRange: "$2,000 - $8,000" },
      { name: "Retaining Wall", slug: "retaining-wall", description: "Retaining wall construction for erosion control and landscaping.", costRange: "$1,500 - $6,000" },
      { name: "Mulching", slug: "mulching", description: "Mulch delivery, spreading, and bed maintenance.", costRange: "$100 - $500" },
    ],
  },
  {
    name: "General Contracting",
    slug: "general-contractors",
    plural: "General Contractors",
    description:
      "Licensed general contractors for home renovations, additions, new construction, and complete remodeling projects.",
    keywords: [
      "general contractor", "home renovation", "home addition", "remodeling contractor",
      "construction company", "home builder", "renovation contractor", "building contractor",
      "gc near me", "licensed contractor",
    ],
    faqs: [
      {
        question: "What does a general contractor do?",
        answer:
          "A general contractor manages your entire construction project — hiring subcontractors, pulling permits, scheduling inspections, sourcing materials, and ensuring quality. They're your single point of contact from start to finish.",
      },
      {
        question: "How much does a general contractor charge?",
        answer:
          "General contractors typically charge 10-20% of total project cost as their management fee. On FairTradeWorker, you receive itemized bids that break down exactly where your money goes — no hidden markups.",
      },
      {
        question: "Do I need a general contractor for my project?",
        answer:
          "For projects involving multiple trades (e.g., a kitchen remodel with plumbing, electrical, and carpentry), a GC saves time and money by coordinating everything. For single-trade work, you can hire specialists directly.",
      },
    ],
    avgCostRange: "$5,000 - $100,000+",
    commonProjects: [
      "Kitchen remodel", "Bathroom renovation", "Home addition",
      "Basement finishing", "Whole house renovation", "New construction",
    ],
    subServices: [
      { name: "Kitchen Remodel", slug: "kitchen-remodel", description: "Full kitchen renovation including cabinets, countertops, and layout changes.", costRange: "$15,000 - $50,000" },
      { name: "Bathroom Remodel", slug: "bathroom-remodel", description: "Complete bathroom renovation with fixtures, tile, and plumbing.", costRange: "$5,000 - $25,000" },
      { name: "Home Addition", slug: "home-addition", description: "Room additions, second stories, and living space expansions.", costRange: "$20,000 - $80,000" },
      { name: "Garage Construction", slug: "garage-construction", description: "Attached and detached garage building and conversion.", costRange: "$15,000 - $40,000" },
      { name: "Deck Building", slug: "deck-building", description: "Custom wood and composite deck design and construction.", costRange: "$4,000 - $15,000" },
      { name: "Basement Finishing", slug: "basement-finishing", description: "Basement remodeling with framing, drywall, flooring, and electrical.", costRange: "$10,000 - $30,000" },
      { name: "New Home Construction", slug: "new-construction", description: "Custom home building from foundation to finish.", costRange: "$150,000 - $500,000+" },
    ],
  },
  {
    name: "Remodeling",
    slug: "remodeling",
    plural: "Remodeling Contractors",
    description:
      "Kitchen, bathroom, and whole-home remodeling from verified contractors with transparent pricing and AI-powered estimates.",
    keywords: [
      "remodeling contractor", "kitchen remodel", "bathroom remodel", "home remodel",
      "renovation contractor", "basement remodel", "remodeling company", "house renovation",
      "interior remodel", "room addition",
    ],
    faqs: [
      {
        question: "How much does a kitchen remodel cost?",
        answer:
          "Kitchen remodels range from $15,000 to $50,000+ depending on scope. A minor refresh (paint, hardware, countertops) runs $10,000-$20,000. A full gut renovation with custom cabinets and appliances starts at $30,000.",
      },
      {
        question: "How long does a bathroom remodel take?",
        answer:
          "A standard bathroom remodel takes 2-4 weeks. Larger master bath renovations with structural changes can take 6-8 weeks. FairTradeWorker contractors provide timeline estimates upfront.",
      },
      {
        question: "How do I budget for a remodel?",
        answer:
          "Use FairTradeWorker's free FairPrice Estimator to get an AI-powered cost estimate instantly. Then post your project and compare real bids from verified contractors to lock in final pricing.",
      },
    ],
    avgCostRange: "$5,000 - $75,000",
    commonProjects: [
      "Kitchen remodel", "Bathroom remodel", "Basement finishing",
      "Room addition", "Whole house remodel", "Garage conversion",
    ],
    subServices: [
      { name: "Kitchen Remodel", slug: "kitchen-remodel", description: "Complete kitchen renovation from cabinets to countertops.", costRange: "$15,000 - $50,000" },
      { name: "Bathroom Remodel", slug: "bathroom-remodel", description: "Full bathroom renovation with modern fixtures and finishes.", costRange: "$5,000 - $25,000" },
      { name: "Basement Remodel", slug: "basement-remodel", description: "Convert unfinished basement into living space.", costRange: "$10,000 - $30,000" },
      { name: "Garage Conversion", slug: "garage-conversion", description: "Convert garage into living space, office, or studio.", costRange: "$8,000 - $25,000" },
      { name: "Room Addition", slug: "room-addition", description: "Add a new room to your home for extra living space.", costRange: "$20,000 - $60,000" },
      { name: "Sunroom Addition", slug: "sunroom-addition", description: "Enclosed sunroom or four-season room construction.", costRange: "$8,000 - $30,000" },
    ],
  },
  {
    name: "Concrete",
    slug: "concrete",
    plural: "Concrete Contractors",
    description:
      "Professional concrete contractors for driveways, patios, foundations, sidewalks, stamped concrete, and flatwork.",
    keywords: [
      "concrete contractor", "concrete driveway", "concrete patio", "foundation repair",
      "stamped concrete", "concrete flatwork", "concrete company", "sidewalk repair",
      "concrete slab", "decorative concrete",
    ],
    faqs: [
      {
        question: "How much does a concrete driveway cost?",
        answer:
          "A standard concrete driveway costs $4-$8 per square foot for basic gray, and $8-$18 per square foot for stamped or decorative finishes. A typical two-car driveway runs $3,000-$7,000.",
      },
      {
        question: "How long does concrete take to cure?",
        answer:
          "Concrete reaches walkable strength in 24-48 hours and drivable strength in 7 days. Full cure takes 28 days. Your contractor will advise on load restrictions during curing.",
      },
      {
        question: "Is stamped concrete worth it?",
        answer:
          "Stamped concrete costs 30-50% less than natural stone or pavers while providing similar aesthetics. It requires less maintenance than pavers. Get bids from verified concrete contractors on FairTradeWorker to compare options.",
      },
    ],
    avgCostRange: "$1,000 - $15,000",
    commonProjects: [
      "Driveway installation", "Patio pouring", "Foundation repair",
      "Sidewalk replacement", "Stamped concrete", "Retaining walls",
    ],
    subServices: [
      { name: "Concrete Driveway", slug: "concrete-driveway", description: "New concrete driveway pouring and replacement.", costRange: "$3,000 - $7,000" },
      { name: "Concrete Patio", slug: "concrete-patio", description: "Backyard patio pouring with optional stamped or stained finishes.", costRange: "$1,500 - $5,000" },
      { name: "Foundation Repair", slug: "foundation-repair", description: "Foundation crack repair, leveling, and structural stabilization.", costRange: "$2,000 - $10,000" },
      { name: "Stamped Concrete", slug: "stamped-concrete", description: "Decorative stamped concrete for patios, driveways, and walkways.", costRange: "$2,000 - $8,000" },
      { name: "Sidewalk Repair", slug: "sidewalk-repair", description: "Sidewalk replacement, leveling, and crack repair.", costRange: "$500 - $2,000" },
      { name: "Concrete Slab", slug: "concrete-slab", description: "Shed, garage, and workshop concrete slab pouring.", costRange: "$1,500 - $5,000" },
    ],
  },
  {
    name: "Fencing",
    slug: "fencing",
    plural: "Fence Contractors",
    description:
      "Fence installation and repair for wood, vinyl, chain-link, aluminum, and composite fencing from verified contractors.",
    keywords: [
      "fence contractor", "fence installation", "wood fence", "vinyl fence",
      "chain link fence", "fence repair", "privacy fence", "fencing company",
      "fence builder", "aluminum fence",
    ],
    faqs: [
      {
        question: "How much does fence installation cost?",
        answer:
          "Fence installation costs $15-$30/linear foot for wood, $20-$40/linear foot for vinyl, and $10-$20/linear foot for chain-link. A 200-foot privacy fence typically costs $3,000-$8,000 installed.",
      },
      {
        question: "What type of fence lasts the longest?",
        answer:
          "Vinyl and aluminum fences last 30-50 years with minimal maintenance. Cedar lasts 15-20 years. Pressure-treated pine lasts 10-15 years. A verified fence contractor on FairTradeWorker can recommend the best option for your budget.",
      },
      {
        question: "Do I need a permit to build a fence?",
        answer:
          "Most cities require a permit for fences over 6 feet. Many require permits for any fence. Your FairTradeWorker contractor will know local requirements and can handle permitting as part of the job.",
      },
    ],
    avgCostRange: "$1,500 - $10,000",
    commonProjects: [
      "Privacy fence installation", "Fence repair", "Gate installation",
      "Vinyl fence installation", "Chain-link fencing", "Fence staining",
    ],
    subServices: [
      { name: "Wood Fence Installation", slug: "wood-fence", description: "Cedar and pine privacy fence installation.", costRange: "$2,000 - $6,000" },
      { name: "Vinyl Fence Installation", slug: "vinyl-fence", description: "Low-maintenance vinyl privacy and picket fence installation.", costRange: "$3,000 - $8,000" },
      { name: "Chain Link Fence", slug: "chain-link-fence", description: "Affordable chain-link fencing for yards and properties.", costRange: "$1,000 - $4,000" },
      { name: "Fence Repair", slug: "fence-repair", description: "Fence post replacement, board repair, and storm damage fixes.", costRange: "$200 - $800" },
      { name: "Gate Installation", slug: "gate-installation", description: "Driveway gates, walk gates, and automatic gate openers.", costRange: "$300 - $3,000" },
      { name: "Aluminum Fence", slug: "aluminum-fence", description: "Decorative aluminum fencing for pools and front yards.", costRange: "$2,500 - $6,000" },
    ],
  },
  {
    name: "Drywall",
    slug: "drywall",
    plural: "Drywall Contractors",
    description:
      "Professional drywall installation, repair, texturing, and finishing for residential and commercial projects.",
    keywords: [
      "drywall contractor", "drywall installation", "drywall repair", "drywall finishing",
      "sheetrock", "drywall texturing", "drywall company", "drywall hanging",
      "plaster repair", "ceiling repair",
    ],
    faqs: [
      {
        question: "How much does drywall installation cost?",
        answer:
          "Drywall installation costs $1.50-$3.50 per square foot including materials and labor. A typical room costs $500-$1,500. Finishing and texturing add $0.50-$1.50 per square foot.",
      },
      {
        question: "Can drywall damage be repaired?",
        answer:
          "Yes — holes, cracks, water damage, and dents can all be repaired. Small patches cost $100-$300. Large repairs or water-damaged sections cost $300-$1,000. Post a repair job on FairTradeWorker for exact quotes.",
      },
      {
        question: "How long does drywall installation take?",
        answer:
          "A single room takes 1-2 days to hang, tape, and finish. A whole house takes 1-2 weeks. Drying time between coats adds 24 hours per coat (typically 3 coats for a smooth finish).",
      },
    ],
    avgCostRange: "$300 - $5,000",
    commonProjects: [
      "New drywall installation", "Drywall repair", "Ceiling repair",
      "Texture application", "Water damage repair", "Soundproofing",
    ],
    subServices: [
      { name: "Drywall Installation", slug: "drywall-installation", description: "New drywall hanging, taping, and finishing for new construction and remodels.", costRange: "$1,000 - $4,000" },
      { name: "Drywall Repair", slug: "drywall-repair", description: "Hole patching, crack repair, and water damage restoration.", costRange: "$100 - $500" },
      { name: "Ceiling Repair", slug: "ceiling-repair", description: "Ceiling drywall repair, sagging fix, and texture matching.", costRange: "$200 - $800" },
      { name: "Drywall Texturing", slug: "drywall-texturing", description: "Knockdown, orange peel, and skip trowel texture application.", costRange: "$500 - $2,000" },
      { name: "Plaster Repair", slug: "plaster-repair", description: "Historic plaster wall and ceiling restoration and repair.", costRange: "$300 - $1,500" },
    ],
  },
];

// ── Mississippi locations ─────────────────────────────────────────────
// Every city/town worth targeting in MS — organized by region
export const SERVICE_LOCATIONS: ServiceLocation[] = [
  // DeSoto County / Memphis Metro (highest population density in MS)
  { city: "Southaven", state: "Mississippi", stateAbbr: "MS", slug: "southaven-ms", metro: "Memphis Metro" },
  { city: "Olive Branch", state: "Mississippi", stateAbbr: "MS", slug: "olive-branch-ms", metro: "Memphis Metro" },
  { city: "Horn Lake", state: "Mississippi", stateAbbr: "MS", slug: "horn-lake-ms", metro: "Memphis Metro" },
  { city: "Hernando", state: "Mississippi", stateAbbr: "MS", slug: "hernando-ms", metro: "Memphis Metro" },
  { city: "Walls", state: "Mississippi", stateAbbr: "MS", slug: "walls-ms", metro: "Memphis Metro" },
  { city: "Nesbit", state: "Mississippi", stateAbbr: "MS", slug: "nesbit-ms", metro: "Memphis Metro" },

  // North Mississippi
  {
    city: "Oxford", state: "Mississippi", stateAbbr: "MS", slug: "oxford-ms", metro: "North Mississippi",
    profile: {
      slug: "oxford-ms",
      tagline: "Home of Ole Miss — Find Trusted Contractors in Oxford",
      description: "Oxford, Mississippi is a growing college town with a mix of historic homes near the Square, new construction off Highway 6, and student housing around the University of Mississippi campus. Whether you're renovating a century-old Victorian on South Lamar or building new in Brittany Woods, FairTradeWorker connects you with verified local contractors who know Oxford's building codes, soil conditions, and architectural character.",
      population: "28,000+",
      highlights: [
        "University of Mississippi (Ole Miss) drives steady housing demand",
        "Historic Square district with protected architectural standards",
        "Rapid growth along Highway 6 and Highway 7 corridors",
        "Hot, humid summers mean HVAC is critical — systems work harder here",
        "Clay-heavy soil causes foundation movement in older neighborhoods",
        "Lafayette County building permits required for most projects",
      ],
      neighborhoods: [
        { name: "The Square", slug: "the-square", description: "Oxford's historic downtown — older buildings, character renovations, strict preservation guidelines." },
        { name: "South Lamar", slug: "south-lamar", description: "Tree-lined residential streets with early 1900s homes. Popular for renovations and additions." },
        { name: "North Lamar", slug: "north-lamar", description: "Mix of residential and commercial. Growing area with new construction and rehab projects." },
        { name: "Old Taylor Road", slug: "old-taylor-road", description: "Established family neighborhood south of town. Larger lots, mature landscaping." },
        { name: "Highway 6 Corridor", slug: "highway-6", description: "Oxford's growth corridor — new subdivisions, commercial builds, and modern construction." },
        { name: "College Hill", slug: "college-hill", description: "Quiet area north of Oxford with rural properties and custom homes." },
        { name: "Brittany Woods", slug: "brittany-woods", description: "Popular subdivision with newer homes. Common projects: fencing, landscaping, interior updates." },
        { name: "Campus Area", slug: "campus-area", description: "Student housing and rental properties near Ole Miss. High turnover drives constant renovation demand." },
        { name: "Wellsgate", slug: "wellsgate", description: "Upscale subdivision south of town. Custom homes, pools, outdoor living spaces." },
        { name: "Grand Oaks", slug: "grand-oaks", description: "Newer development with family homes. Common projects: decks, fencing, garage builds." },
      ],
      localFaqs: [
        {
          question: "Do I need a building permit in Oxford, MS?",
          answer: "Yes — Lafayette County and the City of Oxford require permits for most construction, renovation, and mechanical work. Your FairTradeWorker contractor handles permitting as part of the job. The Oxford Building Department is located at City Hall on University Avenue.",
        },
        {
          question: "What are common home issues in Oxford, MS?",
          answer: "Oxford's clay-heavy soil causes foundation settling and cracking in older homes. High humidity leads to mold and moisture issues, especially in crawl spaces. Aging electrical panels in pre-1980s homes often need upgrading. And Mississippi's hot summers mean HVAC systems work overtime — regular maintenance is essential.",
        },
        {
          question: "How much do contractors charge in Oxford, MS?",
          answer: "Oxford contractor rates are competitive with the North Mississippi average. General contractors charge $30-$60/hour, electricians $50-$100/hour, and plumbers $60-$120/hour. FairTradeWorker gives you project-based estimates upfront, so you never get surprised by hourly billing.",
        },
        {
          question: "Are there contractor licensing requirements in Mississippi?",
          answer: "Mississippi requires a state license from the MS State Board of Contractors for commercial projects over $50,000 and residential projects over $50,000. Many trades (electrical, plumbing, HVAC) require separate specialty licenses. All FairTradeWorker contractors are license-verified before they can bid.",
        },
      ],
      seasonalTips: [
        { season: "Spring", title: "Storm season prep", description: "March through May brings severe storms to North Mississippi. Get your roof inspected, clean gutters, and trim overhanging branches before storm season hits. Roofers and tree services book up fast after major storms." },
        { season: "Summer", title: "HVAC overload season", description: "Oxford summers hit 95+ degrees with high humidity. Get your AC serviced before June. If your system is 10+ years old, consider replacement before it fails mid-July when every HVAC tech in Lafayette County is booked solid." },
        { season: "Fall", title: "Renovation season", description: "September through November is prime renovation time in Oxford. Weather is mild, contractors have more availability, and you can finish projects before the holidays. Ole Miss football season also drives rental property upgrades." },
        { season: "Winter", title: "Interior project season", description: "December through February is ideal for interior work — painting, flooring, kitchen and bathroom remodels. Contractors offer better rates during the slower season. Plan spring landscaping projects now." },
      ],
      nearbyLandmarks: [
        "University of Mississippi (Ole Miss)",
        "The Square (Oxford Town Square)",
        "Rowan Oak (William Faulkner's home)",
        "Oxford Conference Center",
        "Baptist Memorial Hospital - North Mississippi",
        "Lafayette County Courthouse",
        "Oxford Commons Shopping Center",
      ],
    },
  },
  {
    city: "Tupelo", state: "Mississippi", stateAbbr: "MS", slug: "tupelo-ms", metro: "North Mississippi",
    profile: {
      slug: "tupelo-ms",
      tagline: "Northeast Mississippi's Largest City — Verified Contractors in Tupelo",
      description: "Tupelo is the commercial hub of Northeast Mississippi with a population of 38,000+ and growing. From historic homes in the downtown core to new construction in the suburbs off McCullough Boulevard, Tupelo has a diverse housing stock that keeps contractors busy year-round. The city's strong economy, driven by manufacturing and healthcare, supports steady residential and commercial construction demand.",
      population: "38,000+",
      highlights: [
        "Largest city in Northeast Mississippi — strong contractor market",
        "North Mississippi Medical Center drives healthcare construction",
        "Toyota-Wellspring manufacturing corridor creates commercial demand",
        "Mix of historic bungalows, mid-century ranch homes, and modern subdivisions",
        "Tornado-prone region — storm damage repair is constant demand",
        "Lee County building permits required for most projects",
      ],
      neighborhoods: [
        { name: "Downtown Tupelo", slug: "downtown", description: "Historic commercial core with loft conversions, mixed-use renovations, and restaurant build-outs." },
        { name: "Joyner", slug: "joyner", description: "Established family neighborhood. Older homes needing updates — HVAC, electrical, roofing." },
        { name: "Parkway", slug: "parkway", description: "Growing area along the Natchez Trace Parkway corridor. New construction and lot development." },
        { name: "McCullough Boulevard", slug: "mccullough", description: "Tupelo's growth corridor with new subdivisions, retail, and commercial construction." },
        { name: "Saltillo Area", slug: "saltillo", description: "Adjacent community with rapid residential growth. New homes, custom builds, and land development." },
        { name: "Verona Area", slug: "verona", description: "South Lee County suburb with affordable housing and steady renovation demand." },
        { name: "Plantersville", slug: "plantersville", description: "Rural residential area east of Tupelo. Custom homes, barns, and outbuilding construction." },
        { name: "Tupelo Country Club", slug: "country-club", description: "Upscale neighborhood with established homes. Pool installation, outdoor living, and whole-house remodels." },
        { name: "Cliff Gookin", slug: "cliff-gookin", description: "Popular residential area near North Mississippi Medical Center. Steady renovation and maintenance demand." },
        { name: "Elvis Presley Heights", slug: "elvis-presley-heights", description: "Historic neighborhood near the Elvis Birthplace. Character homes with renovation potential." },
      ],
      localFaqs: [
        {
          question: "Do I need a building permit in Tupelo, MS?",
          answer: "Yes — the City of Tupelo and Lee County require building permits for most construction and renovation work. Your FairTradeWorker contractor handles permitting. The Tupelo Building Department is located at the Lee County Government Complex on West Main Street.",
        },
        {
          question: "What are common home issues in Tupelo, MS?",
          answer: "Tupelo sits in the heart of tornado alley — storm damage repair for roofing, siding, and fencing is constant demand. The region's clay soil causes foundation issues in older homes. High humidity creates moisture problems in crawl spaces and attics. Many homes built in the 1950s-1970s need electrical panel upgrades and HVAC replacement.",
        },
        {
          question: "How much do contractors charge in Tupelo, MS?",
          answer: "Tupelo contractor rates are typically 10-15% lower than national averages. General contractors charge $25-$55/hour, electricians $45-$90/hour, and plumbers $55-$110/hour. FairTradeWorker provides project-based estimates so you get a clear price before work starts.",
        },
        {
          question: "Is Tupelo a good market for home renovation?",
          answer: "Yes — Tupelo's growing economy, affordable housing stock, and steady population growth make it an active renovation market. Homes in established neighborhoods like Joyner and Cliff Gookin regularly undergo kitchen/bath remodels, and the McCullough corridor is driving new construction demand.",
        },
      ],
      seasonalTips: [
        { season: "Spring", title: "Tornado season readiness", description: "Northeast Mississippi sees severe weather from March through May. Get your roof inspected, ensure your home's structural integrity, and trim trees near your house. After storms, FairTradeWorker contractors respond fast — post storm damage jobs for priority bidding." },
        { season: "Summer", title: "Beat the heat", description: "Tupelo summers are hot and humid. Service your HVAC before June. If your system struggles to keep up, it's time for an upgrade. Also a great time for exterior painting — long dry days mean faster completion." },
        { season: "Fall", title: "Build season peak", description: "Fall is peak construction season in Tupelo. Mild weather, no storm interruptions, and the holidays create urgency. Book renovation projects early — September fills up fast for general contractors and remodelers." },
        { season: "Winter", title: "Indoor renovation time", description: "Tupelo winters are mild enough for year-round construction, but interior projects are ideal December through February. Kitchen remodels, flooring, drywall — contractors have more availability and often better pricing." },
      ],
      nearbyLandmarks: [
        "Elvis Presley Birthplace",
        "Tupelo Automobile Museum",
        "North Mississippi Medical Center",
        "Natchez Trace Parkway",
        "Tupelo Furniture Market",
        "BancorpSouth Arena",
        "Mall at Barnes Crossing",
        "Tupelo Buffalo Park & Zoo",
        "Lee County Library",
      ],
    },
  },
  { city: "Corinth", state: "Mississippi", stateAbbr: "MS", slug: "corinth-ms", metro: "North Mississippi" },
  { city: "New Albany", state: "Mississippi", stateAbbr: "MS", slug: "new-albany-ms", metro: "North Mississippi" },
  { city: "Batesville", state: "Mississippi", stateAbbr: "MS", slug: "batesville-ms", metro: "North Mississippi" },
  { city: "Grenada", state: "Mississippi", stateAbbr: "MS", slug: "grenada-ms", metro: "North Mississippi" },
  { city: "Holly Springs", state: "Mississippi", stateAbbr: "MS", slug: "holly-springs-ms", metro: "North Mississippi" },
  { city: "Pontotoc", state: "Mississippi", stateAbbr: "MS", slug: "pontotoc-ms", metro: "North Mississippi" },
  { city: "Booneville", state: "Mississippi", stateAbbr: "MS", slug: "booneville-ms", metro: "North Mississippi" },
  { city: "Iuka", state: "Mississippi", stateAbbr: "MS", slug: "iuka-ms", metro: "North Mississippi" },
  { city: "Senatobia", state: "Mississippi", stateAbbr: "MS", slug: "senatobia-ms", metro: "North Mississippi" },
  { city: "Water Valley", state: "Mississippi", stateAbbr: "MS", slug: "water-valley-ms", metro: "North Mississippi" },
  { city: "Ripley", state: "Mississippi", stateAbbr: "MS", slug: "ripley-ms", metro: "North Mississippi" },
  { city: "Baldwyn", state: "Mississippi", stateAbbr: "MS", slug: "baldwyn-ms", metro: "North Mississippi" },
  { city: "Aberdeen", state: "Mississippi", stateAbbr: "MS", slug: "aberdeen-ms", metro: "North Mississippi" },

  // Golden Triangle
  { city: "Starkville", state: "Mississippi", stateAbbr: "MS", slug: "starkville-ms", metro: "Golden Triangle" },
  { city: "Columbus", state: "Mississippi", stateAbbr: "MS", slug: "columbus-ms", metro: "Golden Triangle" },
  { city: "West Point", state: "Mississippi", stateAbbr: "MS", slug: "west-point-ms", metro: "Golden Triangle" },

  // Jackson Metro
  { city: "Jackson", state: "Mississippi", stateAbbr: "MS", slug: "jackson-ms", metro: "Jackson Metro" },
  { city: "Madison", state: "Mississippi", stateAbbr: "MS", slug: "madison-ms", metro: "Jackson Metro" },
  { city: "Brandon", state: "Mississippi", stateAbbr: "MS", slug: "brandon-ms", metro: "Jackson Metro" },
  { city: "Ridgeland", state: "Mississippi", stateAbbr: "MS", slug: "ridgeland-ms", metro: "Jackson Metro" },
  { city: "Clinton", state: "Mississippi", stateAbbr: "MS", slug: "clinton-ms", metro: "Jackson Metro" },
  { city: "Pearl", state: "Mississippi", stateAbbr: "MS", slug: "pearl-ms", metro: "Jackson Metro" },
  { city: "Flowood", state: "Mississippi", stateAbbr: "MS", slug: "flowood-ms", metro: "Jackson Metro" },
  { city: "Byram", state: "Mississippi", stateAbbr: "MS", slug: "byram-ms", metro: "Jackson Metro" },
  { city: "Canton", state: "Mississippi", stateAbbr: "MS", slug: "canton-ms", metro: "Jackson Metro" },
  { city: "Richland", state: "Mississippi", stateAbbr: "MS", slug: "richland-ms", metro: "Jackson Metro" },

  // Central Mississippi
  { city: "Meridian", state: "Mississippi", stateAbbr: "MS", slug: "meridian-ms", metro: "Central Mississippi" },
  { city: "Kosciusko", state: "Mississippi", stateAbbr: "MS", slug: "kosciusko-ms", metro: "Central Mississippi" },
  { city: "Philadelphia", state: "Mississippi", stateAbbr: "MS", slug: "philadelphia-ms", metro: "Central Mississippi" },
  { city: "Louisville", state: "Mississippi", stateAbbr: "MS", slug: "louisville-ms", metro: "Central Mississippi" },

  // Pine Belt
  { city: "Hattiesburg", state: "Mississippi", stateAbbr: "MS", slug: "hattiesburg-ms", metro: "Pine Belt" },
  { city: "Petal", state: "Mississippi", stateAbbr: "MS", slug: "petal-ms", metro: "Pine Belt" },
  { city: "Laurel", state: "Mississippi", stateAbbr: "MS", slug: "laurel-ms", metro: "Pine Belt" },

  // Gulf Coast
  { city: "Gulfport", state: "Mississippi", stateAbbr: "MS", slug: "gulfport-ms", metro: "Gulf Coast" },
  { city: "Biloxi", state: "Mississippi", stateAbbr: "MS", slug: "biloxi-ms", metro: "Gulf Coast" },
  { city: "Ocean Springs", state: "Mississippi", stateAbbr: "MS", slug: "ocean-springs-ms", metro: "Gulf Coast" },
  { city: "Pascagoula", state: "Mississippi", stateAbbr: "MS", slug: "pascagoula-ms", metro: "Gulf Coast" },
  { city: "Gautier", state: "Mississippi", stateAbbr: "MS", slug: "gautier-ms", metro: "Gulf Coast" },
  { city: "Long Beach", state: "Mississippi", stateAbbr: "MS", slug: "long-beach-ms", metro: "Gulf Coast" },
  { city: "Bay St. Louis", state: "Mississippi", stateAbbr: "MS", slug: "bay-st-louis-ms", metro: "Gulf Coast" },
  { city: "Pass Christian", state: "Mississippi", stateAbbr: "MS", slug: "pass-christian-ms", metro: "Gulf Coast" },
  { city: "D'Iberville", state: "Mississippi", stateAbbr: "MS", slug: "diberville-ms", metro: "Gulf Coast" },
  { city: "Moss Point", state: "Mississippi", stateAbbr: "MS", slug: "moss-point-ms", metro: "Gulf Coast" },
  { city: "Waveland", state: "Mississippi", stateAbbr: "MS", slug: "waveland-ms", metro: "Gulf Coast" },

  // Southwest Mississippi
  { city: "Natchez", state: "Mississippi", stateAbbr: "MS", slug: "natchez-ms", metro: "Southwest Mississippi" },
  { city: "Vicksburg", state: "Mississippi", stateAbbr: "MS", slug: "vicksburg-ms", metro: "Southwest Mississippi" },
  { city: "Brookhaven", state: "Mississippi", stateAbbr: "MS", slug: "brookhaven-ms", metro: "Southwest Mississippi" },
  { city: "McComb", state: "Mississippi", stateAbbr: "MS", slug: "mccomb-ms", metro: "Southwest Mississippi" },

  // Southeast Mississippi
  { city: "Picayune", state: "Mississippi", stateAbbr: "MS", slug: "picayune-ms", metro: "Southeast Mississippi" },
  { city: "Columbia", state: "Mississippi", stateAbbr: "MS", slug: "columbia-ms", metro: "Southeast Mississippi" },

  // Delta
  { city: "Greenville", state: "Mississippi", stateAbbr: "MS", slug: "greenville-ms", metro: "Mississippi Delta" },
  { city: "Greenwood", state: "Mississippi", stateAbbr: "MS", slug: "greenwood-ms", metro: "Mississippi Delta" },
  { city: "Clarksdale", state: "Mississippi", stateAbbr: "MS", slug: "clarksdale-ms", metro: "Mississippi Delta" },
  { city: "Cleveland", state: "Mississippi", stateAbbr: "MS", slug: "cleveland-ms", metro: "Mississippi Delta" },
  { city: "Indianola", state: "Mississippi", stateAbbr: "MS", slug: "indianola-ms", metro: "Mississippi Delta" },
];

// ── Helpers ───────────────────────────────────────────────────────────

export function getTradeBySlug(slug: string): Trade | undefined {
  return TRADES.find((t) => t.slug === slug);
}

export function getLocationBySlug(slug: string): ServiceLocation | undefined {
  return SERVICE_LOCATIONS.find((l) => l.slug === slug);
}

export function getSubServiceBySlug(trade: Trade, slug: string): SubService | undefined {
  return trade.subServices.find((s) => s.slug === slug);
}

export function getAllTradeLocationCombos(): { trade: Trade; location: ServiceLocation }[] {
  const combos: { trade: Trade; location: ServiceLocation }[] = [];
  for (const trade of TRADES) {
    for (const location of SERVICE_LOCATIONS) {
      combos.push({ trade, location });
    }
  }
  return combos;
}

/** Generate the H1 for a trade+location page */
export function getTradeLocationTitle(trade: Trade, location: ServiceLocation): string {
  return `${trade.plural} in ${location.city}, ${location.stateAbbr}`;
}

/** Generate meta description for a trade+location page */
export function getTradeLocationDescription(trade: Trade, location: ServiceLocation): string {
  return `Find verified ${trade.plural.toLowerCase()} in ${location.city}, ${location.stateAbbr}. Compare bids, read reviews, and hire with confidence. No lead fees. Free to post your ${trade.name.toLowerCase()} project.`;
}

/** Generate long-tail keywords for a trade+location page */
export function getTradeLocationKeywords(trade: Trade, location: ServiceLocation): string[] {
  const city = location.city.toLowerCase();
  const state = location.stateAbbr.toLowerCase();
  return [
    `${trade.slug} ${city}`,
    `${trade.slug} ${city} ${state}`,
    `${trade.plural.toLowerCase()} near me`,
    `${trade.plural.toLowerCase()} in ${city}`,
    `${trade.plural.toLowerCase()} ${city} ${state}`,
    `best ${trade.plural.toLowerCase()} ${city}`,
    `affordable ${trade.slug} ${city}`,
    `${trade.slug} contractors ${city} ${state}`,
    ...(location.metro ? [`${trade.slug} ${location.metro.toLowerCase()}`] : []),
  ];
}

/** Get all locations that have a full city profile */
export function getProfileLocations(): ServiceLocation[] {
  return SERVICE_LOCATIONS.filter((l) => l.profile != null);
}

/** Get a neighborhood by slug within a city profile */
export function getNeighborhoodBySlug(profile: CityProfile, slug: string): Neighborhood | undefined {
  return profile.neighborhoods.find((n) => n.slug === slug);
}

/** Generate title for sub-service + location page */
export function getSubServiceLocationTitle(subService: SubService, location: ServiceLocation): string {
  return `${subService.name} in ${location.city}, ${location.stateAbbr}`;
}

/** Generate meta description for sub-service + location page */
export function getSubServiceLocationDescription(
  trade: Trade,
  subService: SubService,
  location: ServiceLocation,
): string {
  return `${subService.description} Find verified ${trade.plural.toLowerCase()} in ${location.city}, ${location.stateAbbr} for ${subService.name.toLowerCase()}. Typical cost: ${subService.costRange}. No lead fees.`;
}
