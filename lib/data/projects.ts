export interface ProjectSpecs {
  bhk: string;
  area: string;
  floors: string;
  landParcel: string;
}

export interface NearbyPlace {
  name: string;
  distance: string;
}

export interface Project {
  slug: string;
  name: string;
  location: string;
  status: "Completed" | "Ongoing";
  /** Only set where the unit count is explicitly confirmed — not every project publishes one. */
  villaCount?: number;
  tagline: string;
  image: string;
  gallery: string[];
  description: string[];
  specs: ProjectSpecs;
  amenities: string[];
  nearby: NearbyPlace[];
  mapQuery: string;
  floorPlanImage?: string;
  videoSrc?: string;
}

/**
 * Real projects, sourced from greentechbuilders.in's individual property
 * pages (raw HTML, not an AI-summarized fetch) and cross-checked against
 * screenshots of the Greenock Villas listing. Descriptions are lightly
 * trimmed for length; specs, amenities and nearby distances are verbatim.
 * Exact current pricing/availability isn't reproduced here — see the
 * conversation summary for why — so `status` is kept conservative
 * ("Ongoing" unless a listing explicitly said "Sold Out").
 */
export const PREVIOUS_PROJECTS: Project[] = [
  {
    slug: "greenock-villas",
    name: "Greenock Villas",
    location: "Athani, Kakkanad, Kochi",
    status: "Ongoing",
    villaCount: 30,
    tagline: "A European lifestyle villa community in the heart of Kakkanad",
    image: "/projects/greenock-villas.jpg",
    gallery: ["/projects/greenock-villas.jpg"],
    description: [
      "The luxurious Greenock Villa is a European lifestyle villa where nature and luxury blend in the serene town of Kakkanad — community living of an international standard, built for those who want the best of Kochi without leaving quiet behind.",
      "Spread over 3 acres, Greenock Villa comprises 30 two-storey villas, each with 2,600 sq.ft. of living space and a world-class set of amenities. Every home is built with an unwavering commitment to quality and a disciplined approach to construction.",
    ],
    specs: { bhk: "3 BHK", area: "2,600 sq.ft.", floors: "Ground + One", landParcel: "6 Cent" },
    amenities: [
      "Automatic Gate",
      "Open Party Area",
      "Club House",
      "CCTV Surveillance",
      "Community Room",
      "Individual Landscaped Garden",
      "Health Club",
      "Children's Play Area",
    ],
    nearby: [
      { name: "Infopark", distance: "2 km" },
      { name: "SmartCity", distance: "2 km" },
      { name: "Civil Station", distance: "2 km" },
      { name: "Wonderla", distance: "4 km" },
      { name: "Rajagiri Christu Jayanthi Public School", distance: "3 km" },
      { name: "Sunrise Hospital", distance: "4 km" },
    ],
    mapQuery: "Athani, Kakkanad, Kochi, Kerala, India",
  },
  {
    slug: "mexican-bungalows",
    name: "The Mexican Bungalows",
    location: "Pallikkara, Kakkanad, Kochi",
    status: "Ongoing",
    villaCount: 19,
    tagline: "19 self-sustainable designer bungalows on a 3-acre plot",
    image: "/projects/mexican-bungalows.jpg",
    gallery: ["/projects/mexican-bungalows.jpg", "/projects/mexican-bungalows-2.jpg", "/projects/mexican-bungalows-3.jpg"],
    description: [
      "The Mexican Bungalows provide a lifestyle that blends nature and luxury — 19 self-sustainable designer bungalows set across a peaceful, serene 3-acre plot. Each bungalow comes with a private pool, a center courtyard, a gazebo, a hydroponics vegetable garden, an independent well, and a 5KV solar system.",
      "The living spaces are built around the green landscape rather than against it — the center courtyard is the key design element, blending the home with its surroundings for continuity with nature rather than disruption of it.",
    ],
    specs: { bhk: "3 BHK", area: "3,000 sq.ft.", floors: "Ground + One", landParcel: "12 Cent" },
    amenities: [
      "Private Pool",
      "Center Courtyard",
      "Gazebo",
      "Hydroponics Vegetable Garden",
      "Independent Well",
      "5KV Solar System",
      "Automatic Gate",
      "Video Door Phone",
      "CCTV Surveillance",
      "Community Room",
      "Mini Library",
      "Open Party Area",
      "Club House with Gym",
    ],
    nearby: [
      { name: "Infopark & SmartCity", distance: "5 km" },
      { name: "Wonderla", distance: "4 km" },
    ],
    mapQuery: "Pallikkara, Kakkanad, Kochi, Kerala, India",
  },
  {
    slug: "scotland-yard-villa",
    name: "Scotland Yard Villa",
    location: "Kakkanad-Pallikkara Road, Kochi",
    status: "Ongoing",
    tagline: "A secure, gated community built for life in panache",
    image: "/projects/scotland-yard-villa.jpg",
    gallery: [
      "/projects/scotland-yard-villa.jpg",
      "/projects/scotland-yard-villa-2.jpg",
      "/projects/scotland-yard-villa-3.jpg",
    ],
    description: [
      "Scotland Yard Villa is for those who want to live life king style — a secure, sophisticated, and serene gated community with an automatic gate, video door phone, and CCTV surveillance, alongside a community room, mini library, open party area, and a clubhouse with gym.",
      "Situated just 100 meters from the Kakkanad-Pallikkara Main Road and around 4 km from Infopark Phase I, Phase II, and Smart City, Scotland Yard Villa is built for residents who want panache without sacrificing convenience.",
    ],
    specs: { bhk: "3 & 4 BHK", area: "2,000 sq.ft.", floors: "Ground + One", landParcel: "5 Cent" },
    amenities: [
      "Automatic Gate",
      "Video Door Phone",
      "CCTV Surveillance",
      "Community Room",
      "Mini Library",
      "Open Party Area",
      "Club House with Gym",
      "Centralized Security",
      "Children's Play Area",
    ],
    nearby: [
      { name: "Kakkanad Civil Station", distance: "5 km" },
      { name: "Infopark", distance: "4 km" },
    ],
    mapQuery: "Kakkanad-Pallikkara Road, Kochi, Kerala, India",
  },
  {
    slug: "spanish-villa",
    name: "Spanish Villa",
    location: "Kochi, Kerala",
    status: "Completed",
    tagline: "Extravagant, spacious villas for comfortable family living",
    image: "/projects/spanish-villa.jpg",
    gallery: ["/projects/spanish-villa.jpg", "/projects/spanish-villa-2.jpg"],
    description: [
      "Spanish Villa comprises villas with 2,220 sq.ft. of space, abundant in facilities that make everyday life easier and more comfortable — extravagant yet livable, built for families that want both luxury and peace.",
      "Every home comes with centralized security, a dedicated children's play area, guest parking, and individual water and electricity connections — creating the kind of space a family can genuinely grow into.",
    ],
    specs: { bhk: "3 & 4 BHK", area: "2,220 sq.ft.", floors: "Ground + One", landParcel: "4 Cent" },
    amenities: ["Centralized Security", "Children's Play Area", "Guest Parking", "Individual Water Connection"],
    nearby: [
      { name: "Kakkanad Civil Station", distance: "5 km" },
      { name: "Infopark", distance: "4 km" },
    ],
    mapQuery: "Kochi, Kerala, India",
  },
  {
    slug: "rainwoods-villa",
    name: "Rainwoods Villa",
    location: "Near Infopark, Kakkanad, Kochi",
    status: "Ongoing",
    tagline: "A villa community 2 km from Kochi's IT hub",
    image: "/projects/rainwoods-villa.jpg",
    gallery: ["/projects/rainwoods-villa.jpg"],
    description: [
      "Located just 2 km from Infopark, the IT hub of Kochi, Rainwoods Villa is a community that carries the charm of a developed, futuristic setting while staying serene and hospitable — a touch of nature alongside a touch of city life.",
      "Rainwoods offers customizable floor plans, natural well water with an overhead tank, and camera surveillance alongside amenities like a clubhouse, health club, yoga and meditation space, and a gazebo.",
    ],
    specs: { bhk: "3 BHK", area: "1,550 sq.ft.", floors: "Ground + One", landParcel: "5 Cent" },
    amenities: [
      "Customizable Floor Plans",
      "Natural Well Water",
      "Camera Surveillance",
      "Club House",
      "Health Club",
      "Yoga & Meditation",
      "Gazebo",
    ],
    nearby: [
      { name: "Edapally", distance: "10 km" },
      { name: "Aluva", distance: "12 km" },
    ],
    mapQuery: "Near Infopark, Kakkanad, Kochi, Kerala, India",
  },
  {
    slug: "greencasa-villas",
    name: "Greencasa Villas",
    location: "Pallikkara, Kakkanad, Kochi",
    status: "Completed",
    tagline: "Quiet, modern living close to nature in Pallikkara",
    image: "/projects/greencasa-villas.jpg",
    gallery: ["/projects/greencasa-villas.jpg"],
    description: [
      "Greencasa Villa is a prestigious project at Pallikkara, Kakkanad, built to provide the best in class amenities so residents can live a life of luxury with the perfect blend of elegance, style, and comfort.",
      "Close to nature with a touch of modernity, Greencasa Villas are built for quiet living amid the bustle of the city — architectural finesse and lush landscaping set the tone for the whole community.",
    ],
    specs: { bhk: "3 BHK", area: "1,550 sq.ft.", floors: "Ground + One", landParcel: "5 Cent" },
    amenities: ["Club House", "Yoga and Meditation", "Health Club", "Centralized Security", "Children's Play Area"],
    nearby: [
      { name: "Cochin Airport", distance: "40 mins" },
      { name: "Aluva", distance: "20 mins" },
    ],
    mapQuery: "Pallikkara, Kakkanad, Kochi, Kerala, India",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return PREVIOUS_PROJECTS.find((project) => project.slug === slug);
}
