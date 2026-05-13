// Detailed compatibility questions shown AFTER payment (Phase B onboarding).
export type EQuestion =
  | { id: string; category: string; q: string; type: "single"; options: { v: string; label: string }[] }
  | { id: string; category: string; q: string; type: "multi"; options: { v: string; label: string }[]; max?: number }
  | { id: string; category: string; q: string; type: "number"; min: number; max: number; suffix?: string }
  | { id: string; category: string; q: string; type: "text"; placeholder?: string };

export const BD_EXTENDED_QUESTIONS: EQuestion[] = [
  { id: "salary_range", category: "Lifestyle", q: "Annual salary range", type: "single", options: [
    { v: "lt5", label: "Under ₹5L" }, { v: "5_10", label: "₹5L – ₹10L" }, { v: "10_20", label: "₹10L – ₹20L" },
    { v: "20_50", label: "₹20L – ₹50L" }, { v: "gt50", label: "₹50L+" }, { v: "private", label: "Prefer not to say" },
  ]},
  { id: "profession", category: "About you", q: "Profession / job role", type: "text", placeholder: "e.g. Product Designer" },
  { id: "education", category: "About you", q: "Highest education", type: "single", options: [
    { v: "highschool", label: "High school" }, { v: "bachelors", label: "Bachelor's" },
    { v: "masters", label: "Master's" }, { v: "phd", label: "PhD" }, { v: "other", label: "Other" },
  ]},
  { id: "smoking", category: "Habits", q: "Smoking", type: "single", options: [
    { v: "no", label: "Never" }, { v: "social", label: "Socially" }, { v: "regular", label: "Regularly" },
  ]},
  { id: "drinking", category: "Habits", q: "Drinking", type: "single", options: [
    { v: "no", label: "Never" }, { v: "social", label: "Socially" }, { v: "regular", label: "Regularly" },
  ]},
  { id: "relationship_goals", category: "Intent", q: "Relationship goals", type: "single", options: [
    { v: "marriage", label: "Marriage" }, { v: "longterm", label: "Long-term" },
    { v: "casual", label: "Casual" }, { v: "exploring", label: "Still exploring" },
  ]},
  { id: "religion", category: "Values", q: "Religion", type: "single", options: [
    { v: "hindu", label: "Hindu" }, { v: "muslim", label: "Muslim" }, { v: "christian", label: "Christian" },
    { v: "sikh", label: "Sikh" }, { v: "jain", label: "Jain" }, { v: "buddhist", label: "Buddhist" },
    { v: "spiritual", label: "Spiritual" }, { v: "none", label: "None" }, { v: "other", label: "Other" },
  ]},
  { id: "height_cm", category: "About you", q: "Height (cm)", type: "number", min: 140, max: 220, suffix: "cm" },
  { id: "fitness", category: "Lifestyle", q: "Fitness lifestyle", type: "single", options: [
    { v: "athlete", label: "Athlete" }, { v: "active", label: "Active" },
    { v: "casual", label: "Casual" }, { v: "sedentary", label: "Sedentary" },
  ]},
  { id: "sleep", category: "Lifestyle", q: "Sleep schedule", type: "single", options: [
    { v: "early", label: "Early bird" }, { v: "normal", label: "Regular" }, { v: "owl", label: "Night owl" },
  ]},
  { id: "personality", category: "Personality", q: "Introvert or extrovert?", type: "single", options: [
    { v: "introvert", label: "Introvert" }, { v: "ambivert", label: "Ambivert" }, { v: "extrovert", label: "Extrovert" },
  ]},
  { id: "weekends", category: "Lifestyle", q: "Ideal weekend", type: "multi", max: 3, options: [
    { v: "outdoors", label: "Outdoors" }, { v: "cafes", label: "Cafés" }, { v: "home", label: "Home & chill" },
    { v: "parties", label: "Parties" }, { v: "fitness", label: "Fitness" }, { v: "art", label: "Art / culture" },
  ]},
  { id: "travel", category: "Interests", q: "Travel interest", type: "single", options: [
    { v: "love", label: "Love it" }, { v: "occasional", label: "Occasional" }, { v: "rare", label: "Rarely" },
  ]},
  { id: "languages", category: "About you", q: "Languages you speak", type: "multi", max: 5, options: [
    { v: "english", label: "English" }, { v: "hindi", label: "Hindi" }, { v: "marathi", label: "Marathi" },
    { v: "tamil", label: "Tamil" }, { v: "telugu", label: "Telugu" }, { v: "bengali", label: "Bengali" },
    { v: "kannada", label: "Kannada" }, { v: "punjabi", label: "Punjabi" }, { v: "gujarati", label: "Gujarati" },
  ]},
  { id: "family_pref", category: "Values", q: "Family preferences", type: "single", options: [
    { v: "traditional", label: "Traditional" }, { v: "modern", label: "Modern" }, { v: "balanced", label: "Balanced" },
  ]},
  { id: "future_goals", category: "Intent", q: "Future goals", type: "single", options: [
    { v: "settled", label: "Settle down" }, { v: "career", label: "Career growth" },
    { v: "travel", label: "Travel the world" }, { v: "balanced", label: "Balanced life" },
  ]},
  { id: "pref_age_min", category: "Preferences", q: "Preferred minimum age", type: "number", min: 18, max: 60 },
  { id: "pref_age_max", category: "Preferences", q: "Preferred maximum age", type: "number", min: 18, max: 70 },
  { id: "pref_city", category: "Preferences", q: "Preferred city / location", type: "text", placeholder: "e.g. Mumbai" },
  { id: "intent_seriousness", category: "Intent", q: "How serious about dating?", type: "single", options: [
    { v: "very", label: "Very serious" }, { v: "open", label: "Open to serious" }, { v: "casual", label: "Casual for now" },
  ]},
  { id: "hobbies_extended", category: "Interests", q: "Hobbies & interests", type: "multi", max: 6, options: [
    { v: "reading", label: "Reading" }, { v: "fitness", label: "Fitness" }, { v: "cooking", label: "Cooking" },
    { v: "travel", label: "Travel" }, { v: "gaming", label: "Gaming" }, { v: "art", label: "Art" },
    { v: "music", label: "Music" }, { v: "outdoors", label: "Outdoors" }, { v: "writing", label: "Writing" },
    { v: "photography", label: "Photography" }, { v: "dance", label: "Dance" }, { v: "yoga", label: "Yoga" },
  ]},
];
