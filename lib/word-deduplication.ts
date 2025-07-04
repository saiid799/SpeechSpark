/**
 * Advanced word deduplication utilities with fuzzy matching
 * 
 * This module provides sophisticated duplicate detection that handles:
 * - Case insensitive matching
 * - Accent/diacritic normalization
 * - Punctuation variations
 * - Semantic similarity
 * - Language-specific normalization
 */

/**
 * Normalize a word for comparison by:
 * - Converting to lowercase
 * - Removing diacritics/accents
 * - Normalizing whitespace
 * - Handling common punctuation variations
 */
export function normalizeWord(word: string): string {
  if (!word || typeof word !== 'string') {
    return '';
  }

  return word
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/['']/g, "'") // Normalize apostrophes
    .replace(/[""]/g, '"') // Normalize quotation marks
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Check if two words are duplicates using fuzzy matching
 */
export function areWordsDuplicate(word1: string, word2: string): boolean {
  if (!word1 || !word2) {
    return false;
  }

  const normalized1 = normalizeWord(word1);
  const normalized2 = normalizeWord(word2);

  // Exact match after normalization
  if (normalized1 === normalized2) {
    return true;
  }

  // Check for common variations
  return checkCommonVariations(normalized1, normalized2);
}

/**
 * Check for common word variations that should be considered duplicates
 */
function checkCommonVariations(word1: string, word2: string): boolean {
  // Remove common suffixes for comparison
  const cleanWord1 = removeCommonSuffixes(word1);
  const cleanWord2 = removeCommonSuffixes(word2);

  if (cleanWord1 === cleanWord2 && cleanWord1.length > 3) {
    return true;
  }

  // Check for simple character substitutions
  if (areSimpleVariations(word1, word2)) {
    return true;
  }

  return false;
}

/**
 * Remove common suffixes that might create false duplicates
 */
function removeCommonSuffixes(word: string): string {
  const suffixes = ['s', 'es', 'ed', 'ing', 'er', 'est', 'ly'];
  
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      return word.slice(0, -suffix.length);
    }
  }
  
  return word;
}

/**
 * Check for simple character substitutions (like o/0, i/l, etc.)
 */
function areSimpleVariations(word1: string, word2: string): boolean {
  if (Math.abs(word1.length - word2.length) > 1) {
    return false;
  }

  const substitutions = new Map([
    ['0', 'o'],
    ['1', 'l'],
    ['1', 'i'],
    ['5', 's'],
    ['3', 'e'],
  ]);

  let differences = 0;
  const minLength = Math.min(word1.length, word2.length);

  for (let i = 0; i < minLength; i++) {
    const char1 = word1[i];
    const char2 = word2[i];

    if (char1 !== char2) {
      // Check if it's a known substitution
      const isSubstitution = 
        substitutions.get(char1) === char2 ||
        substitutions.get(char2) === char1;

      if (!isSubstitution) {
        differences++;
      }

      if (differences > 1) {
        return false;
      }
    }
  }

  return differences <= 1;
}

/**
 * Filter out duplicate words from a list of generated words
 * Uses adaptive strictness based on the number of existing words
 */
export function filterDuplicateWords(
  newWords: { original: string; translation: string }[],
  existingWords: { original: string; translation: string }[]
): { original: string; translation: string }[] {
  const existingNormalized = new Set(
    existingWords.map(word => normalizeWord(word.original))
  );

  // Use stricter similarity threshold for users with many existing words
  const similarityThreshold = existingWords.length > 200 ? 0.75 : 0.85;
  
  return newWords.filter(newWord => {
    const normalizedNew = normalizeWord(newWord.original);
    
    // Check exact normalized match
    if (existingNormalized.has(normalizedNew)) {
      return false;
    }

    // Check fuzzy matches against all existing words
    for (const existingWord of existingWords) {
      if (areWordsDuplicate(newWord.original, existingWord.original)) {
        return false;
      }
      
      // Additional semantic similarity check for advanced users
      if (existingWords.length > 200 && 
          areWordsSemanticallyDuplicate(newWord.original, existingWord.original, similarityThreshold)) {
        return false;
      }
    }

    // Check for duplicates within the new words list
    const isDuplicateInNewWords = newWords.some((otherWord, index) => {
      const currentIndex = newWords.indexOf(newWord);
      return index !== currentIndex && areWordsDuplicate(newWord.original, otherWord.original);
    });

    return !isDuplicateInNewWords;
  });
}

/**
 * Enhanced duplicate filtering for users with many existing words
 * This uses more aggressive filtering to avoid subtle duplicates
 */
export function filterDuplicateWordsAdvanced(
  newWords: { original: string; translation: string }[],
  existingWords: { original: string; translation: string }[],
  userWordCount: number = 0
): { original: string; translation: string }[] {
  // Create efficient lookup structures
  const existingNormalized = new Set(
    existingWords.map(word => normalizeWord(word.original))
  );
  
  const existingRoots = new Set(
    existingWords.map(word => removeCommonSuffixes(normalizeWord(word.original)))
  );

  // Adaptive similarity threshold based on user progress
  let similarityThreshold = 0.85;
  if (userWordCount > 300) {
    similarityThreshold = 0.70;
  } else if (userWordCount > 200) {
    similarityThreshold = 0.75;
  } else if (userWordCount > 100) {
    similarityThreshold = 0.80;
  }

  const filteredWords = [];
  const addedNormalized = new Set<string>();

  for (const newWord of newWords) {
    const normalizedNew = normalizeWord(newWord.original);
    const rootNew = removeCommonSuffixes(normalizedNew);
    
    // Skip if we've already added this normalized word
    if (addedNormalized.has(normalizedNew)) {
      continue;
    }

    // Check exact normalized match
    if (existingNormalized.has(normalizedNew)) {
      continue;
    }

    // Check root word duplicates (more aggressive for advanced users)
    if (userWordCount > 150 && existingRoots.has(rootNew) && rootNew.length > 3) {
      continue;
    }

    // Check fuzzy matches
    let isDuplicate = false;
    for (const existingWord of existingWords) {
      if (areWordsDuplicate(newWord.original, existingWord.original)) {
        isDuplicate = true;
        break;
      }
      
      // Semantic similarity check
      if (areWordsSemanticallyDuplicate(newWord.original, existingWord.original, similarityThreshold)) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      filteredWords.push(newWord);
      addedNormalized.add(normalizedNew);
    }
  }

  return filteredWords;
}

/**
 * Language-specific word normalization
 */
export function normalizeWordForLanguage(word: string, language: string): string {
  const baseNormalized = normalizeWord(word);

  switch (language.toLowerCase()) {
    case 'spanish':
    case 'es':
      return normalizeSpanishWord(baseNormalized);
    
    case 'french':
    case 'fr':
      return normalizeFrenchWord(baseNormalized);
    
    case 'german':
    case 'de':
      return normalizeGermanWord(baseNormalized);
    
    case 'portuguese':
    case 'pt':
      return normalizePortugueseWord(baseNormalized);
    
    default:
      return baseNormalized;
  }
}

function normalizeSpanishWord(word: string): string {
  return word
    .replace(/ñ/g, 'n')
    .replace(/[áà]/g, 'a')
    .replace(/[éè]/g, 'e')
    .replace(/[íì]/g, 'i')
    .replace(/[óò]/g, 'o')
    .replace(/[úù]/g, 'u');
}

function normalizeFrenchWord(word: string): string {
  return word
    .replace(/[àáâã]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõ]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/ç/g, 'c');
}

function normalizeGermanWord(word: string): string {
  return word
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

function normalizePortugueseWord(word: string): string {
  return word
    .replace(/[àáâãä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ñ/g, 'n');
}

/**
 * Calculate similarity score between two words (0-1, where 1 is identical)
 */
export function calculateWordSimilarity(word1: string, word2: string): number {
  const normalized1 = normalizeWord(word1);
  const normalized2 = normalizeWord(word2);

  if (normalized1 === normalized2) {
    return 1.0;
  }

  // Levenshtein distance based similarity
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  
  if (maxLength === 0) {
    return 1.0;
  }

  return 1 - (distance / maxLength);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null)
  );

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Advanced duplicate detection that considers semantic similarity threshold
 */
export function areWordsSemanticallyDuplicate(
  word1: string, 
  word2: string, 
  threshold: number = 0.85
): boolean {
  const similarity = calculateWordSimilarity(word1, word2);
  return similarity >= threshold;
}