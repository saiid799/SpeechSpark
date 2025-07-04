import { Word } from "@/types/word";

export interface WordRecommendation {
  word: Word;
  score: number;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface LearningPattern {
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening';
  averageAccuracy: number;
  struggledWords: string[];
  recentActivity: {
    date: string;
    wordsLearned: number;
    averageAccuracy: number;
  }[];
  commonMistakes: {
    wordId: string;
    mistakeType: 'pronunciation' | 'translation' | 'spelling';
    frequency: number;
  }[];
}

export class RecommendationEngine {
  /**
   * Generate smart word recommendations based on user learning patterns
   */
  static generateRecommendations(
    allWords: Word[],
    userProgress: {
      learnedWords: string[];
      recentMistakes: string[];
      learningStreak: number;
      proficiencyLevel: string;
    },
    learningPattern?: LearningPattern
  ): WordRecommendation[] {
    const recommendations: WordRecommendation[] = [];
    
    // Filter out already learned words
    const unlearnedWords = allWords.filter(word => 
      !userProgress.learnedWords.includes(word.id)
    );

    unlearnedWords.forEach(word => {
      const score = this.calculateRecommendationScore(word, userProgress, learningPattern);
      const reasons = this.generateReasons(word, userProgress, learningPattern);
      const priority = this.determinePriority(score);
      
      recommendations.push({
        word,
        score,
        reasons,
        priority
      });
    });

    // Sort by score (highest first) and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * Calculate recommendation score for a word (0-100)
   */
  private static calculateRecommendationScore(
    word: Word,
    userProgress: {
      learnedWords: string[];
      recentMistakes: string[];
      learningStreak: number;
      proficiencyLevel: string;
    },
    learningPattern?: LearningPattern
  ): number {
    let score = 50; // Base score

    // Factor 1: Proficiency level match (0-20 points)
    if (word.proficiencyLevel === userProgress.proficiencyLevel) {
      score += 20;
    } else if (this.isNearbyLevel(word.proficiencyLevel, userProgress.proficiencyLevel)) {
      score += 10;
    }

    // Factor 2: Recent mistakes - prioritize similar words (0-15 points)
    if (userProgress.recentMistakes.some(mistakeId => 
      this.areSimilarWords(word.id, mistakeId)
    )) {
      score += 15;
    }

    // Factor 3: Learning streak bonus (0-10 points)
    if (userProgress.learningStreak > 7) {
      score += 10; // High streak - challenge with harder words
    } else if (userProgress.learningStreak < 3) {
      score += 5; // Low streak - easier words to build confidence
    }

    // Factor 4: Word frequency/commonality (0-10 points)
    score += this.getFrequencyScore(word);

    // Factor 5: Spaced repetition - words not seen recently (0-15 points)
    score += this.getSpacedRepetitionScore(word);

    // Factor 6: Learning pattern match (0-10 points)
    if (learningPattern) {
      score += this.getLearningPatternScore(word, learningPattern);
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate human-readable reasons for recommendation
   */
  private static generateReasons(
    word: Word,
    userProgress: {
      learnedWords: string[];
      recentMistakes: string[];
      learningStreak: number;
      proficiencyLevel: string;
    },
    learningPattern?: LearningPattern
  ): string[] {
    const reasons: string[] = [];

    if (word.proficiencyLevel === userProgress.proficiencyLevel) {
      reasons.push(`Matches your ${userProgress.proficiencyLevel} level`);
    }

    if (userProgress.learningStreak > 7) {
      reasons.push("You're on a streak! Time for a challenge");
    }

    if (learningPattern?.struggledWords && learningPattern.struggledWords.length > 0) {
      reasons.push("Reinforces concepts you've been practicing");
    }

    if (this.isCommonWord()) {
      reasons.push("High-frequency word - very useful to know");
    }

    if (reasons.length === 0) {
      reasons.push("Recommended for your learning journey");
    }

    return reasons;
  }

  /**
   * Determine priority level based on score
   */
  private static determinePriority(score: number): 'high' | 'medium' | 'low' {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  /**
   * Helper methods
   */
  private static isNearbyLevel(wordLevel: string, userLevel: string): boolean {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const wordIndex = levels.indexOf(wordLevel);
    const userIndex = levels.indexOf(userLevel);
    return Math.abs(wordIndex - userIndex) === 1;
  }

  private static areSimilarWords(wordId1: string, wordId2: string): boolean {
    // Simple similarity check - in practice, this could use more sophisticated NLP
    // For now, we'll use a basic string comparison
    return wordId1.toLowerCase().includes(wordId2.toLowerCase()) || 
           wordId2.toLowerCase().includes(wordId1.toLowerCase());
  }

  private static getFrequencyScore(word: Word): number {
    // Score based on word frequency/commonality
    // Common words get higher scores
    const commonWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it'];
    return commonWords.includes(word.original.toLowerCase()) ? 10 : 5;
  }

  private static getSpacedRepetitionScore(word: Word): number {
    // Score based on when word was last seen
    // Words not seen recently get higher scores
    // In a real implementation, this would use actual last seen data
    // For now, we'll use the word's difficulty level as a proxy
    const difficultyLevels = { 'A1': 15, 'A2': 12, 'B1': 10, 'B2': 8, 'C1': 6, 'C2': 4 };
    return difficultyLevels[word.proficiencyLevel as keyof typeof difficultyLevels] || 5;
  }

  private static getLearningPatternScore(_word: Word, pattern: LearningPattern): number {
    let score = 0;
    
    // Boost score if user typically struggles with this type of word
    if (pattern.struggledWords.some(sw => this.areSimilarWords(sw, _word.id))) {
      score += 5;
    }

    // Adjust based on average accuracy
    if (pattern.averageAccuracy < 70) {
      // Lower accuracy - recommend easier words
      score += _word.proficiencyLevel === 'A1' ? 5 : 0;
    } else if (pattern.averageAccuracy > 90) {
      // High accuracy - recommend harder words
      score += ['B2', 'C1', 'C2'].includes(_word.proficiencyLevel) ? 5 : 0;
    }

    return score;
  }

  private static isCommonWord(): boolean {
    // Check if word is commonly used
    return Math.random() > 0.7; // Placeholder logic
  }

  /**
   * Get review recommendations for previously learned words
   */
  static getReviewRecommendations(
    learnedWords: Word[],
    userProgress: {
      recentMistakes: string[];
      lastReviewDates: { [wordId: string]: string };
    }
  ): WordRecommendation[] {
    return learnedWords
      .filter(word => this.needsReview(word, userProgress))
      .map(word => ({
        word,
        score: this.calculateReviewScore(word, userProgress),
        reasons: ['Due for review based on spaced repetition'],
        priority: 'medium' as const
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  private static needsReview(
    word: Word,
    userProgress: { recentMistakes: string[]; lastReviewDates: { [wordId: string]: string } }
  ): boolean {
    const lastReview = userProgress.lastReviewDates[word.id];
    if (!lastReview) return true;

    const daysSinceReview = (Date.now() - new Date(lastReview).getTime()) / (1000 * 60 * 60 * 24);
    const recentMistake = userProgress.recentMistakes.includes(word.id);

    // Need review if it's been more than 7 days or if there was a recent mistake
    return daysSinceReview > 7 || recentMistake;
  }

  private static calculateReviewScore(
    word: Word,
    userProgress: { recentMistakes: string[]; lastReviewDates: { [wordId: string]: string } }
  ): number {
    let score = 50;

    const lastReview = userProgress.lastReviewDates[word.id];
    if (lastReview) {
      const daysSinceReview = (Date.now() - new Date(lastReview).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.min(30, daysSinceReview * 2); // More points for longer time since review
    }

    if (userProgress.recentMistakes.includes(word.id)) {
      score += 20; // Boost for recent mistakes
    }

    return score;
  }
}