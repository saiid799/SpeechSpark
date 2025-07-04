/**
 * Dynamic fallback word generation system for when API quota is exhausted
 * Generates words on-demand using AI with enhanced prompts and local caching
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

interface FallbackWord {
  original: string;
  translation: string;
}

interface CachedFallbackWords {
  words: FallbackWord[];
  generatedAt: number;
  expiresAt: number;
}

// In-memory cache for fallback words (24 hour expiry)
const fallbackCache = new Map<string, CachedFallbackWords>();

// Static fallback words by language and level (no API required)
const STATIC_FALLBACK_WORDS: Record<string, Record<string, FallbackWord[]>> = {
  Turkish: {
    A1: [
      { original: "merhaba", translation: "hello" },
      { original: "güle güle", translation: "goodbye" },
      { original: "teşekkür ederim", translation: "thank you" },
      { original: "lütfen", translation: "please" },
      { original: "evet", translation: "yes" },
      { original: "hayır", translation: "no" },
      { original: "su", translation: "water" },
      { original: "yemek", translation: "food" },
      { original: "yardım", translation: "help" },
      { original: "zaman", translation: "time" },
      { original: "ev", translation: "house" },
      { original: "okul", translation: "school" },
      { original: "araba", translation: "car" },
      { original: "kitap", translation: "book" },
      { original: "aile", translation: "family" },
      { original: "çocuk", translation: "child" },
      { original: "kadın", translation: "woman" },
      { original: "erkek", translation: "man" },
      { original: "büyük", translation: "big" },
      { original: "küçük", translation: "small" },
      { original: "iyi", translation: "good" },
      { original: "kötü", translation: "bad" },
      { original: "güzel", translation: "beautiful" },
      { original: "çirkin", translation: "ugly" },
      { original: "hızlı", translation: "fast" },
      { original: "yavaş", translation: "slow" },
      { original: "sıcak", translation: "hot" },
      { original: "soğuk", translation: "cold" },
      { original: "açık", translation: "open" },
      { original: "kapalı", translation: "closed" },
      { original: "bir", translation: "one" },
      { original: "iki", translation: "two" },
      { original: "üç", translation: "three" },
      { original: "dört", translation: "four" },
      { original: "beş", translation: "five" },
      { original: "altı", translation: "six" },
      { original: "yedi", translation: "seven" },
      { original: "sekiz", translation: "eight" },
      { original: "dokuz", translation: "nine" },
      { original: "on", translation: "ten" },
      { original: "kırmızı", translation: "red" },
      { original: "mavi", translation: "blue" },
      { original: "yeşil", translation: "green" },
      { original: "sarı", translation: "yellow" },
      { original: "siyah", translation: "black" },
      { original: "beyaz", translation: "white" },
      { original: "gelmek", translation: "to come" },
      { original: "gitmek", translation: "to go" },
      { original: "olmak", translation: "to be" },
      { original: "yapmak", translation: "to do" }
    ],
    A2: [
      { original: "restoran", translation: "restaurant" },
      { original: "hastane", translation: "hospital" },
      { original: "ulaşım", translation: "transportation" },
      { original: "iletişim", translation: "communication" },
      { original: "bilgi", translation: "information" },
      { original: "çalışmak", translation: "to work" },
      { original: "öğrenmek", translation: "to learn" },
      { original: "konuşmak", translation: "to speak" },
      { original: "dinlemek", translation: "to listen" },
      { original: "okumak", translation: "to read" },
      { original: "yazmak", translation: "to write" },
      { original: "yemek yapmak", translation: "to cook" },
      { original: "alışveriş", translation: "shopping" },
      { original: "tatil", translation: "vacation" },
      { original: "spor", translation: "sport" },
      { original: "müzik", translation: "music" },
      { original: "film", translation: "movie" },
      { original: "televizyon", translation: "television" },
      { original: "telefon", translation: "phone" },
      { original: "bilgisayar", translation: "computer" },
      { original: "internet", translation: "internet" },
      { original: "para", translation: "money" },
      { original: "işçi", translation: "worker" },
      { original: "öğretmen", translation: "teacher" },
      { original: "doktor", translation: "doctor" },
      { original: "öğrenci", translation: "student" },
      { original: "arkadaş", translation: "friend" },
      { original: "komşu", translation: "neighbor" },
      { original: "şehir", translation: "city" },
      { original: "köy", translation: "village" },
      { original: "ülke", translation: "country" },
      { original: "dil", translation: "language" },
      { original: "kültür", translation: "culture" },
      { original: "sanat", translation: "art" },
      { original: "tarih", translation: "history" },
      { original: "coğrafya", translation: "geography" },
      { original: "matematik", translation: "mathematics" },
      { original: "fen", translation: "science" },
      { original: "edebiyat", translation: "literature" },
      { original: "din", translation: "religion" },
      { original: "felsefe", translation: "philosophy" },
      { original: "politika", translation: "politics" },
      { original: "ekonomi", translation: "economy" },
      { original: "sosyal", translation: "social" },
      { original: "kişisel", translation: "personal" },
      { original: "profesyonel", translation: "professional" },
      { original: "resmi", translation: "official" },
      { original: "gayri resmi", translation: "informal" },
      { original: "modern", translation: "modern" },
      { original: "geleneksel", translation: "traditional" }
    ],
    B1: [
      { original: "teknoloji", translation: "technology" },
      { original: "çevre", translation: "environment" },
      { original: "eğitim", translation: "education" },
      { original: "iş", translation: "business" },
      { original: "kültür", translation: "culture" },
      { original: "siyaset", translation: "politics" },
      { original: "toplum", translation: "society" },
      { original: "gelecek", translation: "future" },
      { original: "geçmiş", translation: "past" },
      { original: "şimdi", translation: "present" },
      { original: "değişmek", translation: "to change" },
      { original: "gelişmek", translation: "to develop" },
      { original: "büyümek", translation: "to grow" },
      { original: "azalmak", translation: "to decrease" },
      { original: "artmak", translation: "to increase" },
      { original: "başlamak", translation: "to start" },
      { original: "bitirmek", translation: "to finish" },
      { original: "devam etmek", translation: "to continue" },
      { original: "durmak", translation: "to stop" },
      { original: "beklemek", translation: "to wait" },
      { original: "düşünmek", translation: "to think" },
      { original: "hissetmek", translation: "to feel" },
      { original: "anlamak", translation: "to understand" },
      { original: "açıklamak", translation: "to explain" },
      { original: "tartışmak", translation: "to discuss" },
      { original: "karar vermek", translation: "to decide" },
      { original: "seçmek", translation: "to choose" },
      { original: "tercih etmek", translation: "to prefer" },
      { original: "önermek", translation: "to suggest" },
      { original: "tavsiye etmek", translation: "to recommend" },
      { original: "planlamak", translation: "to plan" },
      { original: "organize etmek", translation: "to organize" },
      { original: "hazırlamak", translation: "to prepare" },
      { original: "kontrol etmek", translation: "to control" },
      { original: "yönetmek", translation: "to manage" },
      { original: "liderlik etmek", translation: "to lead" },
      { original: "takip etmek", translation: "to follow" },
      { original: "katılmak", translation: "to participate" },
      { original: "katkıda bulunmak", translation: "to contribute" },
      { original: "paylaşmak", translation: "to share" },
      { original: "işbirliği yapmak", translation: "to collaborate" },
      { original: "rekabet etmek", translation: "to compete" },
      { original: "başarılı olmak", translation: "to succeed" },
      { original: "başarısız olmak", translation: "to fail" },
      { original: "deneyim", translation: "experience" },
      { original: "beceri", translation: "skill" },
      { original: "yetenek", translation: "talent" },
      { original: "bilgi", translation: "knowledge" },
      { original: "hikmet", translation: "wisdom" },
      { original: "zeka", translation: "intelligence" }
    ]
  },
  Spanish: {
    A1: [
      { original: "hola", translation: "hello" },
      { original: "adiós", translation: "goodbye" },
      { original: "gracias", translation: "thank you" },
      { original: "por favor", translation: "please" },
      { original: "sí", translation: "yes" },
      { original: "no", translation: "no" },
      { original: "agua", translation: "water" },
      { original: "comida", translation: "food" },
      { original: "ayuda", translation: "help" },
      { original: "tiempo", translation: "time" },
      { original: "casa", translation: "house" },
      { original: "escuela", translation: "school" },
      { original: "coche", translation: "car" },
      { original: "libro", translation: "book" },
      { original: "familia", translation: "family" },
      { original: "niño", translation: "child" },
      { original: "mujer", translation: "woman" },
      { original: "hombre", translation: "man" },
      { original: "grande", translation: "big" },
      { original: "pequeño", translation: "small" },
      { original: "bueno", translation: "good" },
      { original: "malo", translation: "bad" },
      { original: "hermoso", translation: "beautiful" },
      { original: "feo", translation: "ugly" },
      { original: "rápido", translation: "fast" },
      { original: "lento", translation: "slow" },
      { original: "caliente", translation: "hot" },
      { original: "frío", translation: "cold" },
      { original: "abierto", translation: "open" },
      { original: "cerrado", translation: "closed" },
      { original: "uno", translation: "one" },
      { original: "dos", translation: "two" },
      { original: "tres", translation: "three" },
      { original: "cuatro", translation: "four" },
      { original: "cinco", translation: "five" },
      { original: "seis", translation: "six" },
      { original: "siete", translation: "seven" },
      { original: "ocho", translation: "eight" },
      { original: "nueve", translation: "nine" },
      { original: "diez", translation: "ten" },
      { original: "rojo", translation: "red" },
      { original: "azul", translation: "blue" },
      { original: "verde", translation: "green" },
      { original: "amarillo", translation: "yellow" },
      { original: "negro", translation: "black" },
      { original: "blanco", translation: "white" },
      { original: "venir", translation: "to come" },
      { original: "ir", translation: "to go" },
      { original: "ser", translation: "to be" },
      { original: "hacer", translation: "to do" }
    ]
  },
  French: {
    A1: [
      { original: "bonjour", translation: "hello" },
      { original: "au revoir", translation: "goodbye" },
      { original: "merci", translation: "thank you" },
      { original: "s'il vous plaît", translation: "please" },
      { original: "oui", translation: "yes" },
      { original: "non", translation: "no" },
      { original: "eau", translation: "water" },
      { original: "nourriture", translation: "food" },
      { original: "aide", translation: "help" },
      { original: "temps", translation: "time" },
      { original: "maison", translation: "house" },
      { original: "école", translation: "school" },
      { original: "voiture", translation: "car" },
      { original: "livre", translation: "book" },
      { original: "famille", translation: "family" },
      { original: "enfant", translation: "child" },
      { original: "femme", translation: "woman" },
      { original: "homme", translation: "man" },
      { original: "grand", translation: "big" },
      { original: "petit", translation: "small" },
      { original: "bon", translation: "good" },
      { original: "mauvais", translation: "bad" },
      { original: "beau", translation: "beautiful" },
      { original: "laid", translation: "ugly" },
      { original: "rapide", translation: "fast" },
      { original: "lent", translation: "slow" },
      { original: "chaud", translation: "hot" },
      { original: "froid", translation: "cold" },
      { original: "ouvert", translation: "open" },
      { original: "fermé", translation: "closed" },
      { original: "un", translation: "one" },
      { original: "deux", translation: "two" },
      { original: "trois", translation: "three" },
      { original: "quatre", translation: "four" },
      { original: "cinq", translation: "five" },
      { original: "six", translation: "six" },
      { original: "sept", translation: "seven" },
      { original: "huit", translation: "eight" },
      { original: "neuf", translation: "nine" },
      { original: "dix", translation: "ten" },
      { original: "rouge", translation: "red" },
      { original: "bleu", translation: "blue" },
      { original: "vert", translation: "green" },
      { original: "jaune", translation: "yellow" },
      { original: "noir", translation: "black" },
      { original: "blanc", translation: "white" },
      { original: "venir", translation: "to come" },
      { original: "aller", translation: "to go" },
      { original: "être", translation: "to be" },
      { original: "faire", translation: "to do" }
    ]
  }
};

// Basic emergency fallback words for critical system failures (in English)
const EMERGENCY_WORDS_BY_LEVEL: Record<string, FallbackWord[]> = {
  A1: [
    { original: "hello", translation: "greeting" },
    { original: "goodbye", translation: "farewell" },
    { original: "thank you", translation: "gratitude" },
    { original: "please", translation: "polite request" },
    { original: "yes", translation: "affirmative" },
    { original: "no", translation: "negative" },
    { original: "water", translation: "liquid" },
    { original: "food", translation: "nourishment" },
    { original: "help", translation: "assistance" },
    { original: "time", translation: "duration" }
  ],
  A2: [
    { original: "restaurant", translation: "eating place" },
    { original: "hospital", translation: "medical facility" },
    { original: "transportation", translation: "travel" },
    { original: "communication", translation: "talking" },
    { original: "information", translation: "data" }
  ],
  B1: [
    { original: "technology", translation: "modern tools" },
    { original: "environment", translation: "surroundings" },
    { original: "education", translation: "learning" },
    { original: "business", translation: "commerce" },
    { original: "culture", translation: "traditions" }
  ]
};

// Comprehensive language configuration with cultural and linguistic metadata
interface LanguageConfig {
  code: string;
  family: string;
  script: string;
  rtl: boolean;
  culturalRegions: string[];
  commonGreetings: string[];
  wordOrderPattern: string;
  hasGenders: boolean;
  hasTones: boolean;
  complexityFactors: string[];
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  "English": {
    code: "en",
    family: "Germanic",
    script: "Latin",
    rtl: false,
    culturalRegions: ["North America", "UK", "Australia", "Global"],
    commonGreetings: ["hello", "hi", "good morning"],
    wordOrderPattern: "SVO",
    hasGenders: false,
    hasTones: false,
    complexityFactors: ["irregular verbs", "phrasal verbs", "idioms"]
  },
  "Spanish": {
    code: "es",
    family: "Romance",
    script: "Latin",
    rtl: false,
    culturalRegions: ["Latin America", "Spain", "US Hispanic"],
    commonGreetings: ["hola", "buenos días", "buenas tardes"],
    wordOrderPattern: "SVO",
    hasGenders: true,
    hasTones: false,
    complexityFactors: ["gender agreement", "subjunctive mood", "ser vs estar"]
  },
  "French": {
    code: "fr",
    family: "Romance",
    script: "Latin",
    rtl: false,
    culturalRegions: ["France", "Quebec", "Francophone Africa"],
    commonGreetings: ["bonjour", "salut", "bonsoir"],
    wordOrderPattern: "SVO",
    hasGenders: true,
    hasTones: false,
    complexityFactors: ["liaison", "gender agreement", "formal vs informal"]
  },
  "German": {
    code: "de",
    family: "Germanic",
    script: "Latin",
    rtl: false,
    culturalRegions: ["Germany", "Austria", "Switzerland"],
    commonGreetings: ["hallo", "guten Tag", "guten Morgen"],
    wordOrderPattern: "V2",
    hasGenders: true,
    hasTones: false,
    complexityFactors: ["case system", "compound words", "separable verbs"]
  },
  "Italian": {
    code: "it",
    family: "Romance",
    script: "Latin",
    rtl: false,
    culturalRegions: ["Italy", "San Marino", "Vatican"],
    commonGreetings: ["ciao", "buongiorno", "buonasera"],
    wordOrderPattern: "SVO",
    hasGenders: true,
    hasTones: false,
    complexityFactors: ["gender agreement", "double consonants", "verb conjugations"]
  },
  "Portuguese": {
    code: "pt",
    family: "Romance",
    script: "Latin",
    rtl: false,
    culturalRegions: ["Brazil", "Portugal", "Lusophone Africa"],
    commonGreetings: ["olá", "bom dia", "boa tarde"],
    wordOrderPattern: "SVO",
    hasGenders: true,
    hasTones: false,
    complexityFactors: ["nasal sounds", "gender agreement", "continuous aspect"]
  },
  "Russian": {
    code: "ru",
    family: "Slavic",
    script: "Cyrillic",
    rtl: false,
    culturalRegions: ["Russia", "Former Soviet States"],
    commonGreetings: ["привет", "здравствуйте", "добро пожаловать"],
    wordOrderPattern: "SVO flexible",
    hasGenders: true,
    hasTones: false,
    complexityFactors: ["case system", "aspect pairs", "palatalization"]
  },
  "Chinese": {
    code: "zh",
    family: "Sino-Tibetan",
    script: "Chinese characters",
    rtl: false,
    culturalRegions: ["China", "Taiwan", "Singapore", "Chinese diaspora"],
    commonGreetings: ["你好", "早上好", "晚上好"],
    wordOrderPattern: "SVO",
    hasGenders: false,
    hasTones: true,
    complexityFactors: ["tones", "characters", "measure words"]
  },
  "Japanese": {
    code: "ja",
    family: "Japonic",
    script: "Hiragana/Katakana/Kanji",
    rtl: false,
    culturalRegions: ["Japan"],
    commonGreetings: ["こんにちは", "おはよう", "こんばんは"],
    wordOrderPattern: "SOV",
    hasGenders: false,
    hasTones: false,
    complexityFactors: ["keigo (politeness)", "three scripts", "particles"]
  },
  "Korean": {
    code: "ko",
    family: "Koreanic",
    script: "Hangul",
    rtl: false,
    culturalRegions: ["South Korea", "North Korea"],
    commonGreetings: ["안녕하세요", "안녕", "좋은 아침"],
    wordOrderPattern: "SOV",
    hasGenders: false,
    hasTones: false,
    complexityFactors: ["honorifics", "sound changes", "agglutination"]
  },
  "Arabic": {
    code: "ar",
    family: "Semitic",
    script: "Arabic",
    rtl: true,
    culturalRegions: ["Middle East", "North Africa", "Gulf States"],
    commonGreetings: ["السلام عليكم", "أهلا", "مرحبا"],
    wordOrderPattern: "VSO",
    hasGenders: true,
    hasTones: false,
    complexityFactors: ["root system", "vowel patterns", "definite article"]
  },
  "Hindi": {
    code: "hi",
    family: "Indo-European",
    script: "Devanagari",
    rtl: false,
    culturalRegions: ["India", "Indian diaspora"],
    commonGreetings: ["नमस्ते", "नमस्कार", "आदाब"],
    wordOrderPattern: "SOV",
    hasGenders: true,
    hasTones: false,
    complexityFactors: ["gender system", "postpositions", "honorifics"]
  },
  "Bengali": {
    code: "bn",
    family: "Indo-European",
    script: "Bengali",
    rtl: false,
    culturalRegions: ["Bangladesh", "West Bengal", "Bengali diaspora"],
    commonGreetings: ["নমস্কার", "আসসালামু আলাইকুম", "আদাব"],
    wordOrderPattern: "SOV",
    hasGenders: false,
    hasTones: false,
    complexityFactors: ["conjunct consonants", "vowel harmony", "classifier system"]
  },
  "Turkish": {
    code: "tr",
    family: "Turkic",
    script: "Latin",
    rtl: false,
    culturalRegions: ["Turkey", "Turkish diaspora"],
    commonGreetings: ["merhaba", "selam", "iyi günler"],
    wordOrderPattern: "SOV",
    hasGenders: false,
    hasTones: false,
    complexityFactors: ["vowel harmony", "agglutination", "lack of gender"]
  },
  "Dutch": {
    code: "nl",
    family: "Germanic",
    script: "Latin",
    rtl: false,
    culturalRegions: ["Netherlands", "Belgium", "Suriname"],
    commonGreetings: ["hallo", "goedemorgen", "goedemiddag"],
    wordOrderPattern: "V2",
    hasGenders: true,
    hasTones: false,
    complexityFactors: ["gender system", "separable verbs", "diminutives"]
  },
  "Swedish": {
    code: "sv",
    family: "Germanic",
    script: "Latin",
    rtl: false,
    culturalRegions: ["Sweden", "Finland Swedish"],
    commonGreetings: ["hej", "god morgon", "god kväll"],
    wordOrderPattern: "V2",
    hasGenders: true,
    hasTones: false,
    complexityFactors: ["pitch accent", "definite article suffix", "two genders"]
  },
  "Persian": {
    code: "fa",
    family: "Indo-European",
    script: "Persian",
    rtl: true,
    culturalRegions: ["Iran", "Afghanistan", "Tajikistan"],
    commonGreetings: ["سلام", "درود", "صبح بخیر"],
    wordOrderPattern: "SOV",
    hasGenders: false,
    hasTones: false,
    complexityFactors: ["ezafe construction", "compound verbs", "no grammatical gender"]
  },
  "Indonesian": {
    code: "id",
    family: "Austronesian",
    script: "Latin",
    rtl: false,
    culturalRegions: ["Indonesia", "Indonesian diaspora"],
    commonGreetings: ["halo", "selamat pagi", "selamat siang"],
    wordOrderPattern: "SVO",
    hasGenders: false,
    hasTones: false,
    complexityFactors: ["affixation", "reduplication", "no verb conjugation"]
  },
  "Swahili": {
    code: "sw",
    family: "Niger-Congo",
    script: "Latin",
    rtl: false,
    culturalRegions: ["East Africa", "Tanzania", "Kenya"],
    commonGreetings: ["hujambo", "habari", "salama"],
    wordOrderPattern: "SVO",
    hasGenders: false,
    hasTones: false,
    complexityFactors: ["noun classes", "agglutination", "Arabic loanwords"]
  },
  "Greek": {
    code: "el",
    family: "Indo-European",
    script: "Greek",
    rtl: false,
    culturalRegions: ["Greece", "Cyprus", "Greek diaspora"],
    commonGreetings: ["γεια σας", "καλημέρα", "καλησπέρα"],
    wordOrderPattern: "SVO",
    hasGenders: true,
    hasTones: false,
    complexityFactors: ["case system", "verb aspects", "three genders"]
  }
};

/**
 * Generate culturally-aware vocabulary categories based on proficiency level
 */
function getVocabularyCategories(proficiencyLevel: string): string[] {
  const categories = {
    A1: [
      "Basic greetings and politeness", "Family and relationships", "Numbers and time",
      "Colors and basic adjectives", "Body parts and health", "Food and drinks",
      "Home and furniture", "Weather", "Transportation", "Basic emotions"
    ],
    A2: [
      "Shopping and money", "Travel and directions", "Work and professions",
      "Education and school", "Hobbies and leisure", "Technology basics",
      "Restaurant and dining", "Clothing and fashion", "Nature and animals",
      "Daily routines and activities"
    ],
    B1: [
      "Media and entertainment", "Environment and sustainability", "Culture and traditions",
      "Sports and fitness", "Health and medicine", "Business and economy",
      "Politics and society", "Arts and creativity", "Relationships and dating",
      "Personal development"
    ],
    B2: [
      "Abstract concepts and ideas", "Professional terminology", "Academic subjects",
      "Scientific concepts", "Philosophy and ethics", "Global issues",
      "Technology and innovation", "Psychology and emotions", "Legal and formal language",
      "Advanced cultural references"
    ],
    C1: [
      "Specialized technical vocabulary", "Literary and artistic expression",
      "Complex social issues", "Advanced academic discourse", "Nuanced emotional vocabulary",
      "Idioms and colloquialisms", "Professional jargon", "Sophisticated argumentation",
      "Cultural nuances and subtleties", "Advanced metaphorical language"
    ]
  };
  
  return categories[proficiencyLevel as keyof typeof categories] || categories.A1;
}

/**
 * Generate culturally-informed AI prompt for any language
 */
function createAdvancedLanguagePrompt(
  learningLanguage: string,
  nativeLanguage: string,
  proficiencyLevel: string,
  count: number,
  existingWords: { original: string }[] = []
): string {
  const langConfig = LANGUAGE_CONFIGS[learningLanguage];
  const categories = getVocabularyCategories(proficiencyLevel);
  const existingWordsString = existingWords.map(w => w.original).join(", ");
  
  // Build language-specific instructions
  let languageSpecificInstructions = "";
  
  if (langConfig) {
    languageSpecificInstructions = `
🏛️ LINGUISTIC FRAMEWORK for ${learningLanguage}:
- Language Family: ${langConfig.family}
- Script System: ${langConfig.script}
- Text Direction: ${langConfig.rtl ? "Right-to-Left" : "Left-to-Right"}
- Word Order: ${langConfig.wordOrderPattern}
- Gender System: ${langConfig.hasGenders ? "Has grammatical gender" : "No grammatical gender"}
- Tonal System: ${langConfig.hasTones ? "Tonal language - include tone marks" : "Non-tonal"}
- Cultural Regions: ${langConfig.culturalRegions.join(", ")}
- Key Challenges: ${langConfig.complexityFactors.join(", ")}

🌍 CULTURAL ADAPTATION:
- Reflect vocabulary used in: ${langConfig.culturalRegions.join(", ")}
- Consider cultural contexts and social norms
- Use regionally appropriate variants
- Include culturally relevant concepts`;
  }

  const scriptInstructions = langConfig?.script === "Chinese characters" 
    ? "Use simplified Chinese characters with pinyin romanization"
    : langConfig?.script === "Arabic" 
    ? "Use proper Arabic script with diacritics where necessary"
    : langConfig?.script === "Cyrillic"
    ? "Use standard Cyrillic script"
    : langConfig?.script === "Devanagari"
    ? "Use proper Devanagari script"
    : "Use standard orthography with proper accent marks";

  return `You are an expert linguist and cultural consultant specializing in ${learningLanguage} language pedagogy. Generate ${count} authentic, high-frequency vocabulary words for ${proficiencyLevel} level learners.

🎯 GENERATION PARAMETERS:
- Target Language: ${learningLanguage}
- Native Language: ${nativeLanguage}  
- Proficiency Level: ${proficiencyLevel}
- Word Count: ${count}
- Purpose: Emergency fallback vocabulary for continuous learning

${languageSpecificInstructions}

📚 VOCABULARY CATEGORIES (select from these themes):
${categories.map((cat, i) => `${i + 1}. ${cat}`).join("\n")}

🚫 EXCLUSION LIST (avoid these existing words):
${existingWordsString.length > 0 ? existingWordsString.slice(0, 800) : "None provided"}

⚡ SELECTION CRITERIA:
- Frequency: Choose high-frequency words used in daily communication
- Utility: Prioritize vocabulary that unlocks further learning
- Authenticity: Use words native speakers actually use
- Cultural Relevance: Include concepts important to ${learningLanguage} culture
- Progression: Ensure appropriate difficulty for ${proficiencyLevel} level

🔤 ORTHOGRAPHIC STANDARDS:
- ${scriptInstructions}
- Follow standard spelling conventions
- Include proper capitalization where applicable
- Use official/formal variants understood across regions

🌐 CULTURAL INTELLIGENCE:
- Reflect modern ${learningLanguage}-speaking societies
- Include contemporary vocabulary and concepts
- Consider social contexts and usage appropriateness
- Avoid archaic or overly formal terms unless culturally significant

📊 DIFFICULTY CALIBRATION for ${proficiencyLevel}:
${proficiencyLevel === 'A1' ? '- Concrete, everyday vocabulary\n- Simple, common words\n- Basic communication needs' : ''}
${proficiencyLevel === 'A2' ? '- Practical life situations\n- Extended basic vocabulary\n- Simple descriptions and experiences' : ''}
${proficiencyLevel === 'B1' ? '- Abstract concepts introduction\n- Opinion and preference expression\n- Workplace and academic basics' : ''}
${proficiencyLevel === 'B2' ? '- Complex ideas and discussions\n- Specialized terminology\n- Nuanced expression capability' : ''}
${proficiencyLevel === 'C1' ? '- Sophisticated vocabulary\n- Idiomatic expressions\n- Professional and academic terminology' : ''}

📋 OUTPUT SPECIFICATION:
Return ONLY a valid JSON array with authentic vocabulary:
[
  {
    "original": "native_${learningLanguage}_word_with_proper_script",
    "translation": "precise_${nativeLanguage}_definition_or_equivalent"
  }
]

Generate exactly ${count} words that will empower learners to communicate effectively and progress in their ${learningLanguage} journey.`;
}

/**
 * Generate fallback words dynamically using advanced AI with cultural intelligence
 */
async function generateDynamicFallbackWords(
  learningLanguage: string,
  nativeLanguage: string,
  proficiencyLevel: string,
  count: number,
  existingWords: { original: string }[] = []
): Promise<FallbackWord[]> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn("No AI API key available for dynamic fallback generation");
    return [];
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent vocabulary
        topP: 0.8,
        maxOutputTokens: 4096,
      }
    });
    
    const prompt = createAdvancedLanguagePrompt(
      learningLanguage,
      nativeLanguage,
      proficiencyLevel,
      count,
      existingWords
    );

    console.log(`Generating ${count} ${learningLanguage} words for ${proficiencyLevel} level with cultural intelligence...`);
    
    const result = await model.generateContent(prompt);
    const content = await result.response.text();
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("AI response did not contain valid JSON:", content.slice(0, 200));
      throw new Error("No valid JSON found in AI response");
    }

    const words: FallbackWord[] = JSON.parse(jsonMatch[0]);
    
    // Validate and filter words
    const validWords = words.filter(word => 
      word.original && 
      word.translation && 
      word.original.trim().length > 0 && 
      word.translation.trim().length > 0
    );
    
    // Filter out duplicates with existing words
    const existingSet = new Set(existingWords.map(w => w.original.toLowerCase()));
    const uniqueWords = validWords.filter(word => 
      !existingSet.has(word.original.toLowerCase())
    );

    console.log(`✅ Generated ${uniqueWords.length}/${count} unique ${learningLanguage} ${proficiencyLevel} words`);
    return uniqueWords.slice(0, count);

  } catch (error) {
    console.error(`❌ Error generating ${learningLanguage} fallback words:`, error);
    return [];
  }
}

/**
 * Intelligent cache management with language-specific optimization
 */
async function getCachedOrGenerateFallbackWords(
  learningLanguage: string,
  nativeLanguage: string,
  proficiencyLevel: string,
  count: number,
  existingWords: { original: string }[] = []
): Promise<FallbackWord[]> {
  const cacheKey = `${learningLanguage}-${proficiencyLevel}`;
  const now = Date.now();
  
  // Check cache first
  const cached = fallbackCache.get(cacheKey);
  if (cached && now < cached.expiresAt) {
    console.log(`📦 Using cached fallback words for ${learningLanguage} ${proficiencyLevel}`);
    
    // Filter out words that now exist in user's vocabulary
    const existingSet = new Set(existingWords.map(w => w.original.toLowerCase()));
    const availableWords = cached.words.filter(word => 
      !existingSet.has(word.original.toLowerCase())
    );
    
    // If we have enough cached words, return them
    if (availableWords.length >= count) {
      return availableWords.slice(0, count);
    }
    
    console.log(`⚠️ Cache has only ${availableWords.length}/${count} available words, generating more...`);
  }

  // Determine cache size based on language complexity and usage patterns
  const langConfig = LANGUAGE_CONFIGS[learningLanguage];
  const cacheMultiplier = getCacheMultiplier(learningLanguage, proficiencyLevel, langConfig);
  const wordsToGenerate = Math.max(count * cacheMultiplier, 100);

  console.log(`🔄 Generating ${wordsToGenerate} words for cache (requested: ${count})`);

  // Generate new words with retry logic for different strategies
  let words: FallbackWord[] = [];
  let attempts = 0;
  const maxAttempts = 3;

  while (words.length < count && attempts < maxAttempts) {
    try {
      const newWords = await generateDynamicFallbackWords(
        learningLanguage,
        nativeLanguage,
        proficiencyLevel,
        wordsToGenerate,
        existingWords
      );

      words = [...words, ...newWords];
      
      // Remove duplicates
      const uniqueWords = Array.from(
        new Map(words.map(w => [w.original.toLowerCase(), w])).values()
      );
      words = uniqueWords;

      if (words.length >= count) break;
      
      attempts++;
      console.log(`🔁 Attempt ${attempts}: Generated ${words.length}/${count} words`);
      
    } catch (error) {
      console.error(`❌ Generation attempt ${attempts + 1} failed:`, error);
      attempts++;
    }
  }

  // Cache the results with dynamic expiry based on success rate
  if (words.length > 0) {
    const successRate = words.length / wordsToGenerate;
    const cacheExpiry = getCacheExpiry(successRate, langConfig);
    
    fallbackCache.set(cacheKey, {
      words,
      generatedAt: now,
      expiresAt: now + cacheExpiry
    });
    
    console.log(`💾 Cached ${words.length} ${learningLanguage} words (expires in ${Math.round(cacheExpiry / (1000 * 60 * 60))}h)`);
  }

  return words.slice(0, count);
}

/**
 * Calculate cache multiplier based on language characteristics
 */
function getCacheMultiplier(learningLanguage: string, proficiencyLevel: string, langConfig?: LanguageConfig): number {
  let multiplier = 2; // Base multiplier
  
  // Increase cache for complex languages
  if (langConfig?.hasTones) multiplier += 1; // Tonal languages like Chinese
  if (langConfig?.hasGenders) multiplier += 0.5; // Gendered languages
  if (langConfig?.script !== "Latin") multiplier += 1; // Non-Latin scripts
  if (langConfig?.family === "Sino-Tibetan") multiplier += 1; // Chinese character complexity
  if (langConfig?.complexityFactors && langConfig.complexityFactors.length > 3) multiplier += 0.5; // Highly complex languages
  
  // Increase cache for higher proficiency levels
  const levelMultipliers = { A1: 1, A2: 1.2, B1: 1.5, B2: 2, C1: 2.5, C2: 3 };
  multiplier *= levelMultipliers[proficiencyLevel as keyof typeof levelMultipliers] || 1;
  
  // Cap the multiplier for performance
  return Math.min(multiplier, 5);
}

/**
 * Calculate cache expiry based on generation success and language complexity
 */
function getCacheExpiry(successRate: number, langConfig?: LanguageConfig): number {
  let baseHours = 24; // 24 hours base
  
  // Longer cache for successful generations
  if (successRate > 0.8) baseHours = 48;
  if (successRate > 0.9) baseHours = 72;
  
  // Longer cache for complex languages (harder to generate)
  if (langConfig?.script !== "Latin") baseHours += 12;
  if (langConfig?.hasTones) baseHours += 12;
  if (langConfig?.complexityFactors && langConfig.complexityFactors.length > 3) baseHours += 6;
  
  return Math.min(baseHours * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000); // Max 7 days
}

/**
 * Multi-strategy fallback word generation with cultural intelligence
 */
/* async function generateWithMultipleStrategies(
  learningLanguage: string,
  nativeLanguage: string,
  proficiencyLevel: string,
  count: number,
  existingWords: { original: string }[] = []
): Promise<FallbackWord[]> {
  const strategies = [
    // Strategy 1: Cultural categories approach
    async () => {
      const categories = getVocabularyCategories(proficiencyLevel);
      const wordsPerCategory = Math.ceil(count / categories.length);
      const words: FallbackWord[] = [];
      
      for (const category of categories.slice(0, 3)) { // Limit to 3 categories
        try {
          const categoryWords = await generateCategorySpecificWords(
            learningLanguage,
            nativeLanguage,
            proficiencyLevel,
            wordsPerCategory,
            category,
            [...existingWords, ...words]
          );
          words.push(...categoryWords);
          if (words.length >= count) break;
        } catch (error) {
          console.warn(`Failed to generate words for category ${category}:`, error);
        }
      }
      return words.slice(0, count);
    },
    
    // Strategy 2: Frequency-based approach
    async () => {
      return await generateDynamicFallbackWords(
        learningLanguage,
        nativeLanguage,
        proficiencyLevel,
        count,
        existingWords
      );
    },
    
    // Strategy 3: Cultural context approach
    async () => {
      const langConfig = LANGUAGE_CONFIGS[learningLanguage];
      if (!langConfig) throw new Error("No language config available");
      
      return await generateCulturallyContextualWords(
        learningLanguage,
        nativeLanguage,
        proficiencyLevel,
        count,
        langConfig,
        existingWords
      );
    }
  ];
  
  // Try strategies in order until we get enough words
  for (let i = 0; i < strategies.length; i++) {
    try {
      console.log(`🎯 Trying generation strategy ${i + 1}...`);
      const words = await strategies[i]();
      if (words.length >= Math.min(count, 5)) { // At least 5 words or requested count
        return words;
      }
    } catch (error) {
      console.warn(`Strategy ${i + 1} failed:`, error);
    }
  }
  
  return [];
} */

/**
 * Generate words for specific vocabulary categories
 */
/* async function generateCategorySpecificWords(
  learningLanguage: string,
  nativeLanguage: string,
  proficiencyLevel: string,
  count: number,
  category: string,
  existingWords: { original: string }[] = []
): Promise<FallbackWord[]> {
  if (!process.env.GOOGLE_AI_API_KEY) return [];
  
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  const prompt = `Generate ${count} ${learningLanguage} vocabulary words specifically for: "${category}"

Requirements:
- Proficiency Level: ${proficiencyLevel}
- Category Focus: ${category}
- Target Language: ${learningLanguage}
- Translation Language: ${nativeLanguage}
- Exclude existing words: ${existingWords.map(w => w.original).join(", ").slice(0, 300)}

Output JSON format:
[{"original": "${learningLanguage}_word", "translation": "${nativeLanguage}_meaning"}]`;

  const result = await model.generateContent(prompt);
  const content = await result.response.text();
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  
  if (!jsonMatch) throw new Error("No valid JSON in category-specific response");
  
  return JSON.parse(jsonMatch[0]);
} */

/**
 * Generate culturally contextual words based on language configuration
 */
/* async function generateCulturallyContextualWords(
  learningLanguage: string,
  nativeLanguage: string,
  proficiencyLevel: string,
  count: number,
  langConfig: LanguageConfig,
  existingWords: { original: string }[] = []
): Promise<FallbackWord[]> {
  if (!process.env.GOOGLE_AI_API_KEY) return [];
  
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  const culturalContext = `
Cultural Regions: ${langConfig.culturalRegions.join(", ")}
Language Family: ${langConfig.family}
Key Cultural Concepts: Modern life, social interaction, traditional values
Regional Variations: Use standard forms understood across ${langConfig.culturalRegions.join(" and ")}`;

  const prompt = `As a cultural linguist expert in ${learningLanguage}, generate ${count} culturally authentic vocabulary words.

${culturalContext}

Requirements:
- Level: ${proficiencyLevel}
- Cultural authenticity for ${langConfig.culturalRegions.join(", ")}
- Modern usage patterns
- Socially appropriate vocabulary
- Regional standard forms

Exclude: ${existingWords.map(w => w.original).join(", ").slice(0, 300)}

JSON format:
[{"original": "${learningLanguage}_word", "translation": "${nativeLanguage}_meaning"}]`;

  const result = await model.generateContent(prompt);
  const content = await result.response.text();
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  
  if (!jsonMatch) throw new Error("No valid JSON in cultural context response");
  
  return JSON.parse(jsonMatch[0]);
} */

/**
 * Get fallback words when AI generation fails - prioritizes static words over API calls
 */
export async function getFallbackWords(
  learningLanguage: string,
  proficiencyLevel: string,
  count: number,
  existingWords: { original: string }[] = [],
  nativeLanguage: string = "English"
): Promise<FallbackWord[]> {
  console.log(`Requesting ${count} fallback words for ${learningLanguage} ${proficiencyLevel}`);
  const existingWordsSet = new Set(existingWords.map(w => w.original.toLowerCase()));

  // First priority: Use static fallback words (no API required)
  const staticWords = STATIC_FALLBACK_WORDS[learningLanguage]?.[proficiencyLevel];
  if (staticWords && staticWords.length > 0) {
    const availableStaticWords = staticWords.filter(
      word => !existingWordsSet.has(word.original.toLowerCase())
    );
    
    if (availableStaticWords.length >= count) {
      const shuffled = [...availableStaticWords].sort(() => Math.random() - 0.5);
      const result = shuffled.slice(0, count);
      console.log(`Using ${result.length} static fallback words for ${learningLanguage} ${proficiencyLevel}`);
      return result;
    }
    
    if (availableStaticWords.length > 0) {
      console.log(`Found ${availableStaticWords.length} static words (need ${count}), using available and supplementing with other sources`);
      // Use what we have and supplement with other methods
      const staticResult = availableStaticWords.slice(0, count);
      const remaining = count - staticResult.length;
      
      if (remaining > 0) {
        // Try to get additional words from other sources
        try {
          const additionalWords = await getCachedOrGenerateFallbackWords(
            learningLanguage,
            nativeLanguage,
            proficiencyLevel,
            remaining,
            [...existingWords, ...staticResult]
          );
          
          if (additionalWords.length > 0) {
            console.log(`Supplemented ${staticResult.length} static words with ${additionalWords.length} dynamic words`);
            return [...staticResult, ...additionalWords.slice(0, remaining)];
          }
        } catch (error) {
          console.error("Failed to supplement static words with dynamic generation:", error);
        }
        
        // If dynamic generation failed, return what we have
        console.log(`Returning ${staticResult.length} static words (requested ${count})`);
        return staticResult;
      }
    }
  }

  // Second priority: Try dynamic generation with AI (if no static words available)
  try {
    const dynamicWords = await getCachedOrGenerateFallbackWords(
      learningLanguage,
      nativeLanguage,
      proficiencyLevel,
      count,
      existingWords
    );

    if (dynamicWords.length >= count) {
      console.log(`Successfully generated ${dynamicWords.length} dynamic fallback words for ${learningLanguage}`);
      return dynamicWords.slice(0, count);
    }

    console.log(`Dynamic generation returned ${dynamicWords.length} words, need ${count}. Trying emergency fallback...`);

  } catch (error) {
    console.error("Dynamic fallback generation failed:", error);
  }

  // Third priority: Emergency fallback with translation attempt
  const emergencyWords = EMERGENCY_WORDS_BY_LEVEL[proficiencyLevel] || EMERGENCY_WORDS_BY_LEVEL.A1;
  
  // For non-English languages, try to translate emergency words
  if (learningLanguage !== "English") {
    try {
      const translatedWords = await translateEmergencyWords(
        emergencyWords.slice(0, count),
        learningLanguage,
        nativeLanguage
      );
      
      if (translatedWords.length > 0) {
        const availableTranslated = translatedWords.filter(
          word => !existingWordsSet.has(word.original.toLowerCase())
        );
        
        if (availableTranslated.length > 0) {
          console.log(`Using ${availableTranslated.length} translated emergency words for ${learningLanguage}`);
          return availableTranslated.slice(0, count);
        }
      }
    } catch (error) {
      console.error("Emergency translation failed:", error);
    }
  }

  // Final fallback: use English emergency words
  const availableEmergencyWords = emergencyWords.filter(
    word => !existingWordsSet.has(word.original.toLowerCase())
  );

  if (availableEmergencyWords.length === 0) {
    console.warn(`No emergency fallback words available for ${learningLanguage} ${proficiencyLevel}`);
    return [];
  }

  const shuffled = [...availableEmergencyWords].sort(() => Math.random() - 0.5);
  const result = shuffled.slice(0, count);
  
  console.log(`Using ${result.length} emergency English words as final fallback`);
  return result;
}

/**
 * Translate emergency words to target language
 */
async function translateEmergencyWords(
  englishWords: FallbackWord[],
  targetLanguage: string,
  nativeLanguage: string
): Promise<FallbackWord[]> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    return [];
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const wordsToTranslate = englishWords.map(w => w.original).join(", ");
    
    const prompt = `Translate these essential English words to ${targetLanguage}:
${wordsToTranslate}

Requirements:
- Provide authentic ${targetLanguage} translations
- Use standard/formal variants
- Maintain same meaning and context
- Use proper orthography

Output format (JSON only):
[
  {
    "original": "${targetLanguage}_word",
    "translation": "${nativeLanguage}_meaning"
  }
]`;

    const result = await model.generateContent(prompt);
    const content = await result.response.text();
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON in translation response");
    }

    const translations: FallbackWord[] = JSON.parse(jsonMatch[0]);
    console.log(`Translated ${translations.length} emergency words to ${targetLanguage}`);
    return translations;

  } catch (error) {
    console.error("Emergency word translation failed:", error);
    return [];
  }
}

/**
 * Check if fallback words are available for a language/level
 * Now always returns true since we can generate dynamically
 */
export function hasFallbackWords(_learningLanguage: string, _proficiencyLevel: string): boolean {
  // With dynamic generation, we can always attempt to provide fallback words
  // At minimum, we have emergency English words as final fallback
  return true;
}

/**
 * Get available fallback word count for a language/level
 * Returns estimated count since we generate dynamically
 */
export function getFallbackWordCount(
  _learningLanguage: string,
  proficiencyLevel: string,
  _existingWords: { original: string }[] = []
): number {
  // For dynamic system, we can theoretically generate many words
  // Return a reasonable estimate based on emergency words + dynamic potential
  const emergencyCount = EMERGENCY_WORDS_BY_LEVEL[proficiencyLevel]?.length || 10;
  const dynamicPotential = 1000; // AI can generate many words
  
  return emergencyCount + dynamicPotential;
}

/**
 * Clear fallback cache (useful for testing or manual refresh)
 */
export function clearFallbackCache(): void {
  fallbackCache.clear();
  console.log("Fallback word cache cleared");
}

/**
 * Get cache statistics
 */
export function getFallbackCacheStats(): {
  size: number;
  entries: Array<{
    key: string;
    wordCount: number;
    generatedAt: Date;
    expiresAt: Date;
  }>;
} {
  const entries = Array.from(fallbackCache.entries()).map(([key, value]) => ({
    key,
    wordCount: value.words.length,
    generatedAt: new Date(value.generatedAt),
    expiresAt: new Date(value.expiresAt)
  }));

  return {
    size: fallbackCache.size,
    entries
  };
}

/**
 * Pre-warm cache for commonly used languages/levels with intelligent prioritization
 */
export async function preWarmFallbackCache(
  languages: string[] = [],
  levels: string[] = ["A1", "A2", "B1"],
  nativeLanguage: string = "English"
): Promise<void> {
  // If no specific languages provided, use all supported languages
  const targetLanguages = languages.length > 0 ? languages : Object.keys(LANGUAGE_CONFIGS);
  
  console.log(`🔥 Pre-warming fallback cache for ${targetLanguages.length} languages...`);
  
  // Prioritize languages by complexity (complex languages cached first)
  const prioritizedLanguages = targetLanguages.sort((a, b) => {
    const configA = LANGUAGE_CONFIGS[a];
    const configB = LANGUAGE_CONFIGS[b];
    
    const complexityA = (configA?.complexityFactors.length || 0) + 
                       (configA?.hasTones ? 2 : 0) + 
                       (configA?.script !== "Latin" ? 1 : 0);
    const complexityB = (configB?.complexityFactors.length || 0) + 
                       (configB?.hasTones ? 2 : 0) + 
                       (configB?.script !== "Latin" ? 1 : 0);
    
    return complexityB - complexityA; // Most complex first
  });

  console.log(`📊 Language priority order: ${prioritizedLanguages.join(", ")}`);
  
  // Process in batches to avoid overwhelming the API
  const batchSize = 5;
  const totalOperations = prioritizedLanguages.length * levels.length;
  let completed = 0;
  
  for (let i = 0; i < prioritizedLanguages.length; i += batchSize) {
    const languageBatch = prioritizedLanguages.slice(i, i + batchSize);
    const batchPromises = [];
    
    for (const language of languageBatch) {
      for (const level of levels) {
        const langConfig = LANGUAGE_CONFIGS[language];
        const wordsToCache = langConfig ? getCacheMultiplier(language, level, langConfig) * 25 : 50;
        
        const promise = getCachedOrGenerateFallbackWords(
          language,
          nativeLanguage,
          level,
          wordsToCache,
          []
        ).then(() => {
          completed++;
          console.log(`✅ Pre-warmed ${language} ${level} (${completed}/${totalOperations})`);
        }).catch(error => {
          completed++;
          console.error(`❌ Failed to pre-warm ${language} ${level}:`, error.message);
        });
        
        batchPromises.push(promise);
      }
    }
    
    // Wait for current batch to complete before starting next
    await Promise.all(batchPromises);
    
    // Small delay between batches to be API-friendly
    if (i + batchSize < prioritizedLanguages.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  const stats = getFallbackCacheStats();
  console.log(`🎉 Pre-warming complete! Cache has ${stats.size} entries with ${stats.entries.reduce((sum, entry) => sum + entry.wordCount, 0)} total words.`);
}

/**
 * Smart cache warming based on user language preferences and usage patterns
 */
export async function intelligentCacheWarming(
  userLanguages: Array<{language: string, level: string, priority: number}>,
  nativeLanguage: string = "English"
): Promise<void> {
  console.log("🧠 Starting intelligent cache warming based on user patterns...");
  
  // Sort by priority and warm most important first
  const sortedLanguages = userLanguages.sort((a, b) => b.priority - a.priority);
  
  for (const {language, level, priority} of sortedLanguages) {
    try {
      // const langConfig = LANGUAGE_CONFIGS[language];
      const wordsToCache = Math.max(priority * 25, 50); // More words for higher priority
      
      console.log(`🎯 Warming ${language} ${level} (priority: ${priority}, words: ${wordsToCache})`);
      
      await getCachedOrGenerateFallbackWords(
        language,
        nativeLanguage,
        level,
        wordsToCache,
        []
      );
      
      // Brief pause between languages
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Failed to warm ${language} ${level}:`, error);
    }
  }
  
  console.log("✨ Intelligent cache warming completed!");
}

/**
 * Get language support coverage report
 */
export function getLanguageSupportReport(): {
  totalLanguages: number;
  supportedLanguages: string[];
  languagesByComplexity: Array<{language: string, complexity: number, features: string[]}>;
  scriptTypes: Record<string, string[]>;
  languageFamilies: Record<string, string[]>;
} {
  const supportedLanguages = Object.keys(LANGUAGE_CONFIGS);
  
  const languagesByComplexity = supportedLanguages.map(lang => {
    const config = LANGUAGE_CONFIGS[lang];
    const complexity = config.complexityFactors.length + 
                      (config.hasTones ? 2 : 0) + 
                      (config.hasGenders ? 1 : 0) + 
                      (config.script !== "Latin" ? 1 : 0);
    
    return {
      language: lang,
      complexity,
      features: [
        ...(config.hasTones ? ["Tonal"] : []),
        ...(config.hasGenders ? ["Gendered"] : []),
        ...(config.script !== "Latin" ? ["Non-Latin Script"] : []),
        ...config.complexityFactors
      ]
    };
  }).sort((a, b) => b.complexity - a.complexity);
  
  const scriptTypes: Record<string, string[]> = {};
  const languageFamilies: Record<string, string[]> = {};
  
  supportedLanguages.forEach(lang => {
    const config = LANGUAGE_CONFIGS[lang];
    
    if (!scriptTypes[config.script]) scriptTypes[config.script] = [];
    scriptTypes[config.script].push(lang);
    
    if (!languageFamilies[config.family]) languageFamilies[config.family] = [];
    languageFamilies[config.family].push(lang);
  });
  
  return {
    totalLanguages: supportedLanguages.length,
    supportedLanguages,
    languagesByComplexity,
    scriptTypes,
    languageFamilies
  };
}