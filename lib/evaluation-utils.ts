export interface QuizStats {
    correctAnswers: number;
    totalQuestions: number;
    streak: number;
    attempts?: { questionId: string; attempts: number }[];
  }
  
  export interface QuizPerformance {
    stars: number;
    title: string;
    description: string;
    accuracy: number;
  }
  
  export const calculateQuizPerformance = (stats: QuizStats): QuizPerformance => {
    const accuracy = (stats.correctAnswers / stats.totalQuestions) * 100;
    
    // Base score (0-3 stars) from accuracy
    const accuracyScore = (stats.correctAnswers / stats.totalQuestions) * 3;
    
    // Streak bonus (0-1.5 stars)
    const streakBonus = Math.min(stats.streak / 5, 1.5);
    
    // Penalty for multiple attempts (-0.5 stars max)
    const attemptsRatio = stats.attempts?.reduce((acc, curr) => 
      acc + (curr.attempts > 1 ? 0.1 : 0), 0) ?? 0;
    const attemptsPenalty = Math.min(attemptsRatio, 0.5);
  
    // Calculate final stars
    const stars = Math.min(Math.round((accuracyScore + streakBonus - attemptsPenalty) * 2) / 2, 5);
  
    return {
      stars,
      accuracy,
      ...getPerformanceMessage(stars, accuracy, stats.streak)
    };
  };
  
  const getPerformanceMessage = (
    stars: number,
    accuracy: number,
    streak: number
  ): { title: string; description: string } => {
    if (stars >= 4.5) return {
      title: "Outstanding!",
      description: `Perfect performance with a ${streak} answer streak!`
    };
    
    if (stars >= 4) return {
      title: "Excellent!",
      description: `${accuracy.toFixed(1)}% accuracy with great consistency!`
    };
    
    if (stars >= 3) return {
      title: "Great Progress!",
      description: "Strong understanding with room to grow."
    };
    
    if (stars >= 2) return {
      title: "Good Effort!",
      description: "Keep practicing to improve your accuracy."
    };
    
    return {
      title: "Keep Going!",
      description: "Practice makes perfect - don't give up!"
    };
  };
  
  export const getStarColor = (index: number): string => {
    const colors = [
      "from-yellow-300 to-yellow-500",
      "from-yellow-300 via-amber-400 to-yellow-500", 
      "from-amber-300 via-yellow-400 to-orange-400",
      "from-yellow-300 via-amber-400 to-orange-500",
      "from-amber-300 via-orange-400 to-red-400"
    ];
    return colors[index % colors.length];
  };