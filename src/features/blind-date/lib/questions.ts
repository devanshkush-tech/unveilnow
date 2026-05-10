// Premium 15-section Blind Date questionnaire. Each question contributes to the
// internal compatibility vector computed server-side. We never expose vectors or
// raw answers outside the user / admin scope.
export type Question =
  | { id: string; category: string; q: string; type: "single"; options: { v: string; label: string }[] }
  | { id: string; category: string; q: string; type: "multi"; options: { v: string; label: string }[]; max?: number }
  | { id: string; category: string; q: string; type: "scale"; min: number; max: number; minLabel: string; maxLabel: string };

export const BD_QUESTIONS: Question[] = [
  // Communication
  { id: "comm_style", category: "Communication", q: "How do you like to communicate?", type: "single", options: [
    { v: "fast", label: "⚡ Fast & frequent" }, { v: "thoughtful", label: "🧠 Thoughtful & spaced" }, { v: "flexible", label: "🔄 Depends on the vibe" },
  ]},
  { id: "comm_depth", category: "Communication", q: "What conversations light you up?", type: "single", options: [
    { v: "deep", label: "🌊 Deep & meaningful" }, { v: "playful", label: "😂 Witty & playful" }, { v: "both", label: "✨ Both" },
  ]},

  // Personality
  { id: "social_energy", category: "Personality", q: "How would you describe yourself?", type: "single", options: [
    { v: "introvert", label: "🌙 Introvert" }, { v: "ambivert", label: "⚖️ Ambivert" }, { v: "extrovert", label: "☀️ Extrovert" },
  ]},
  { id: "humour", category: "Personality", q: "Your humour is mostly…", type: "single", options: [
    { v: "dry", label: "😐 Dry & sarcastic" }, { v: "silly", label: "🤪 Silly & light" }, { v: "dark", label: "🖤 Dark" }, { v: "wholesome", label: "🌻 Wholesome" },
  ]},
  { id: "energy_level", category: "Personality", q: "Your daily social energy", type: "scale", min: 1, max: 5, minLabel: "Quiet", maxLabel: "High-buzz" },

  // Intent
  { id: "intent", category: "Intent", q: "What are you looking for?", type: "single", options: [
    { v: "serious", label: "💞 Something serious" }, { v: "casual", label: "✨ Casual" }, { v: "exploring", label: "🔍 Still figuring it out" },
  ]},
  { id: "future_goals", category: "Intent", q: "Where do you see yourself in 3 years?", type: "single", options: [
    { v: "settled", label: "🏡 Settled with someone" }, { v: "building", label: "🚀 Building career" }, { v: "exploring", label: "🌍 Exploring the world" },
  ]},

  // Lifestyle
  { id: "sleep", category: "Lifestyle", q: "Your sleep schedule", type: "single", options: [
    { v: "early", label: "🌅 Early bird" }, { v: "normal", label: "🌤️ Regular hours" }, { v: "owl", label: "🌙 Night owl" },
  ]},
  { id: "wlb", category: "Lifestyle", q: "Work-life balance", type: "scale", min: 1, max: 5, minLabel: "Work-first", maxLabel: "Life-first" },
  { id: "fitness", category: "Lifestyle", q: "Fitness & health", type: "single", options: [
    { v: "daily", label: "💪 Daily routine" }, { v: "weekly", label: "🏃 A few times a week" }, { v: "casual", label: "🧘 Casual" },
  ]},

  // Hobbies
  { id: "hobbies", category: "Interests", q: "Pick your top hobbies", type: "multi", max: 4, options: [
    { v: "reading", label: "📚 Reading" }, { v: "fitness", label: "🏋️ Fitness" }, { v: "cooking", label: "🍳 Cooking" },
    { v: "travel", label: "✈️ Travel" }, { v: "gaming", label: "🎮 Gaming" }, { v: "art", label: "🎨 Art" },
    { v: "music", label: "🎵 Music" }, { v: "outdoors", label: "🏞️ Outdoors" }, { v: "writing", label: "✍️ Writing" },
  ]},

  // Travel
  { id: "travel_vibe", category: "Travel", q: "Ideal getaway", type: "single", options: [
    { v: "mountains", label: "🏔️ Mountains" }, { v: "beach", label: "🏖️ Beach" }, { v: "city", label: "🌆 City escape" }, { v: "offbeat", label: "🗺️ Offbeat" },
  ]},

  // Music & Movies
  { id: "music", category: "Taste", q: "Music you live for", type: "multi", max: 3, options: [
    { v: "pop", label: "🎤 Pop" }, { v: "indie", label: "🎸 Indie" }, { v: "hiphop", label: "🎧 Hip-hop" },
    { v: "rock", label: "🤘 Rock" }, { v: "classical", label: "🎻 Classical" }, { v: "edm", label: "🎛️ EDM" },
    { v: "lofi", label: "☕ Lo-fi" }, { v: "regional", label: "🇮🇳 Regional" },
  ]},
  { id: "movies", category: "Taste", q: "Go-to movie nights", type: "single", options: [
    { v: "thriller", label: "🔪 Thriller" }, { v: "rom", label: "💗 Rom-com" }, { v: "scifi", label: "🚀 Sci-fi" }, { v: "indie", label: "🎬 Indie" }, { v: "all", label: "🎞️ All of it" },
  ]},

  // Emotional compatibility
  { id: "conflict", category: "Emotional", q: "When there's conflict, you…", type: "single", options: [
    { v: "talk", label: "🗣️ Talk it out immediately" }, { v: "cool", label: "🧊 Cool off, then talk" }, { v: "avoid", label: "🤐 Avoid until it passes" },
  ]},
  { id: "emotional_open", category: "Emotional", q: "How openly do you share feelings?", type: "scale", min: 1, max: 5, minLabel: "Reserved", maxLabel: "Wide open" },
  { id: "love_language", category: "Emotional", q: "Your love language", type: "single", options: [
    { v: "words", label: "💬 Words of affirmation" }, { v: "time", label: "⏰ Quality time" }, { v: "touch", label: "🤝 Physical touch" },
    { v: "gifts", label: "🎁 Gifts" }, { v: "acts", label: "🛠️ Acts of service" },
  ]},

  // Values
  { id: "values", category: "Values", q: "What matters most?", type: "multi", max: 3, options: [
    { v: "family", label: "👨‍👩‍👧 Family" }, { v: "career", label: "💼 Career" }, { v: "freedom", label: "🕊️ Freedom" },
    { v: "growth", label: "🌱 Growth" }, { v: "honesty", label: "🤍 Honesty" }, { v: "adventure", label: "🧭 Adventure" }, { v: "stability", label: "🛡️ Stability" },
  ]},
  { id: "spiritual", category: "Values", q: "Spiritual / religious side", type: "single", options: [
    { v: "spiritual", label: "✨ Spiritual not religious" }, { v: "religious", label: "🙏 Religious" }, { v: "agnostic", label: "🤔 Agnostic" }, { v: "atheist", label: "🚫 Not at all" },
  ]},

  // Dealbreakers (kept generic)
  { id: "dealbreakers", category: "Dealbreakers", q: "Pick your firm no's", type: "multi", max: 3, options: [
    { v: "smoking", label: "🚭 Smoking" }, { v: "drinking", label: "🍷 Heavy drinking" }, { v: "long_distance", label: "📏 Long distance" },
    { v: "no_ambition", label: "💤 No ambition" }, { v: "different_values", label: "🌀 Different values" },
  ]},
];

export const BD_CATEGORIES = Array.from(new Set(BD_QUESTIONS.map((q) => q.category)));
