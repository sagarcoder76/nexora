export type Mode = "flight" | "train" | "bus" | "cab";

export type Role = "traveller" | "guide" | "provider" | "hotelier" | "employer" | "admin";

export type Availability = "available" | "filling" | "sold_out";

export type Offer = {
  id: string;
  mode: Mode;
  operator: string;
  code: string;
  from: string;
  to: string;
  departISO: string;
  arriveISO: string;
  durationMin: number;
  price: number;
  seats: number;
  availability: Availability;
  rating: number;
  meta: string[];
  source: string;
  updatedMinsAgo: number;
  cabForWholeVehicle?: boolean;
};

export type JourneyLeg = Offer & {
  connection?: "confirmed" | "estimated" | "walk";
  waitMin?: number;
  walkMin?: number;
};

export type Journey = {
  id: string;
  from: string;
  to: string;
  date: string;
  pax: number;
  legs: JourneyLeg[];
  fare: number;
  transferEstimate: number;
  totalCost: number;
  totalDurationMin: number;
  transfers: number;
  modes: Mode[];
  estimated: boolean;
  warning?: string;
  tag?: string;
  difficulty: "easy" | "moderate" | "demanding";
};

export type City = {
  name: string;
  state: string;
  lat: number;
  lng: number;
  airport?: string;
  rail?: string;
  hub?: boolean;
  blurb: string;
  highlights: string[];
  image?: string;
};

export type Destination = {
  city: string;
  tagline: string;
  from: number;
  season: string;
  image: string;
  tags: string[];
};

export type Hotel = {
  id: string;
  name: string;
  city: string;
  type: "Hotel" | "Hostel" | "Homestay" | "Resort" | "Guesthouse";
  price: number;
  rating: number;
  reviews: number;
  distanceKm: number;
  amenities: string[];
  image: string;
  description: string;
  rooms: { name: string; price: number; capacity: number; left: number }[];
  verified: boolean;
};

export type Guide = {
  id: string;
  name: string;
  city: string;
  languages: string[];
  categories: string[];
  experience: number;
  rating: number;
  reviews: number;
  pricePerDay: number;
  bio: string;
  certifications: string[];
  initials: string;
  verified: boolean;
  availableDates: string[];
};

export type Job = {
  id: string;
  title: string;
  employer: string;
  city: string;
  type: "Full-time" | "Part-time" | "Seasonal" | "Contract";
  salaryMin: number;
  salaryMax: number;
  posted: string;
  tags: string[];
  description: string;
  requirements: string[];
  verified: boolean;
};

export type User = {
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type Booking = {
  id: string;
  type: "transport" | "hotel" | "guide" | "job";
  title: string;
  subtitle: string;
  date: string;
  amount: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  createdAt: string;
  reference: string;
};

export type TrustedContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  verified: boolean;
};

export type ShareSession = {
  id: string;
  token: string;
  journeyTitle: string;
  origin: string;
  destination: string;
  eta: string;
  contactIds: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lat: number;
  lng: number;
  progress: number;
  history: { lat: number; lng: number; at: string }[];
};

export type GuideRequest = {
  id: string;
  guideId: string;
  guideName: string;
  city: string;
  date: string;
  groupSize: number;
  note: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

export type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  employer: string;
  name: string;
  email: string;
  resumeName: string;
  note: string;
  status: "submitted" | "shortlisted" | "interview" | "closed";
  createdAt: string;
};

export type SearchQuery = {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  pax: number;
  modes?: Mode[];
  budget?: number;
  sort?: "cost" | "duration" | "depart" | "rating";
};
