// File: lib/languageData.ts

export const languages = [
  { name: "English", code: "en", flag: "/flags/gb.svg" },
  { name: "Spanish", code: "es", flag: "/flags/es.svg" },
  { name: "French", code: "fr", flag: "/flags/fr.svg" },
  { name: "German", code: "de", flag: "/flags/de.svg" },
  { name: "Italian", code: "it", flag: "/flags/it.svg" },
  { name: "Portuguese", code: "pt", flag: "/flags/pt.svg" },
  { name: "Russian", code: "ru", flag: "/flags/ru.svg" },
  { name: "Chinese", code: "zh", flag: "/flags/cn.svg" },
  { name: "Japanese", code: "ja", flag: "/flags/jp.svg" },
  { name: "Korean", code: "ko", flag: "/flags/kr.svg" },
  { name: "Arabic", code: "ar", flag: "/flags/arab.svg" },
  { name: "Hindi", code: "hi", flag: "/flags/in.svg" },
  { name: "Bengali", code: "bn", flag: "/flags/bd.svg" },
  { name: "Turkish", code: "tr", flag: "/flags/tr.svg" },
  { name: "Dutch", code: "nl", flag: "/flags/nl.svg" },
  { name: "Swedish", code: "sv", flag: "/flags/se.svg" },
  { name: "Persian", code: "fa", flag: "/flags/ir.svg" }, // Using Iran flag for Persian
  { name: "Indonesian", code: "id", flag: "/flags/id.svg" },
  { name: "Swahili", code: "sw", flag: "/flags/tz.svg" }, // Using Tanzania flag for Swahili
  { name: "Greek", code: "el", flag: "/flags/gr.svg" },
];

// Only A1 and A2 for initial selection
export const proficiencyLevels = [
  {
    value: "A1",
    label: "A1 - Beginner",
    description:
      "Basic ability to communicate and exchange information in a simple way",
    wordCount: 1000,
    benefit:
      "Perfect for complete beginners and those starting their language journey",
  },
  {
    value: "A2",
    label: "A2 - Elementary",
    description: "Can understand and express oneself in familiar situations",
    wordCount: 1000,
    benefit: "Build upon basic knowledge and expand your vocabulary",
  },
];

// Full level progression
export const allProficiencyLevels = [
  ...proficiencyLevels,
  {
    value: "B1",
    label: "B1 - Intermediate",
    description: "Can deal with most situations encountered while traveling",
    wordCount: 1000,
    benefit: "Unlock after completing A2",
  },
  {
    value: "B2",
    label: "B2 - Upper Intermediate",
    description: "Can interact with native speakers with fluency",
    wordCount: 1000,
    benefit: "Unlock after completing B1",
  },
  {
    value: "C1",
    label: "C1 - Advanced",
    description: "Can use language flexibly and effectively",
    wordCount: 1000,
    benefit: "Unlock after completing B2",
  },
];
