export interface Testimonial {
  name: string;
  role: string;
  /** Only set when the reviewer named a specific property themselves. */
  project?: string;
  /** Set for reviews originally given to Greentech Builders, so the brand they praised by name stays honest rather than silently swapped. */
  company?: string;
  quote: string;
  rating: number;
}

/**
 * Real client reviews, verified against each site's raw HTML directly (an
 * AI-summarized fetch gave inconsistent name/quote pairings on a first
 * pass) — lightly trimmed for length and punctuation, substance unchanged.
 * No photos of reviewers are used; see TestimonialsSection for why.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Biju Paulson & Sonu Jacob",
    role: "Homeowners",
    project: "Mexican Bungalows, Kakkanad",
    quote:
      "The day we received the keys to our new home at Mexican Bungalows was a dream come true! From the moment we started the journey, their team was exceptional, and the quality of our villa in Kakkanad has completely exceeded our expectations.",
    rating: 5,
  },
  {
    name: "Suju Mathew",
    role: "Homeowner",
    quote:
      "They didn't just build a structure; they crafted the perfect, beautiful home we always envisioned for our family. Every step, from construction to the final finish, showed their commitment to quality and excellence.",
    rating: 5,
  },
  {
    name: "Rucha Pramod",
    role: "Homeowner",
    project: "Mexican Bungalows, Kakkanad",
    quote:
      "We were just browsing for properties without a serious intention to proceed, but then we came across their Mexican Bungalows project. It was a truly unique concept that immediately caught our eyes and touched our hearts.",
    rating: 5,
  },
  {
    name: "The Zerna Family",
    role: "Homeowners",
    quote:
      "This house has a wonderful, special feeling — we absolutely love it. What we love the most is the beautiful design and layout of the kitchen and the dining room.",
    rating: 5,
  },
  {
    name: "Rajan Geevarghese",
    role: "Homeowner",
    company: "Greentech Builders",
    quote:
      "Our decision to choose Greentech for our dream apartment in Cochin was simple. It was confirmed to be a smart decision from the beginning of the project and till the very end. You have a responsible and creative team of professionals, and that indeed is the factor that makes your flats and apartment projects a success. Even when we weren't able to visit the site regularly, your team made us feel like we were in safe hands.",
    rating: 5,
  },
  {
    name: "Mohamed Kaleel",
    role: "Homeowner",
    company: "Greentech Builders",
    project: "Kakkanad",
    quote:
      "Thank you so much for the fantastic job you did on our flat at Kakkanad, especially in the living room, bedroom, and kitchen. We really appreciated both your creative ideas and advice and your excellent professional work.",
    rating: 5,
  },
  {
    name: "Thomas Alexander & Elizabeth",
    role: "Homeowners",
    company: "Greentech Builders",
    quote:
      "Thank you so much for an amazing job in our new house. We were very happy when we opened our front door for the first time to see your work.",
    rating: 5,
  },
  {
    name: "Sudheer Menon",
    role: "Homeowner",
    company: "Greentech Builders",
    quote: "We are proud to be a member of the Greentech family, and we're expecting even bigger things ahead.",
    rating: 5,
  },
];
