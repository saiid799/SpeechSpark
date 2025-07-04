import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target,
  ChevronRight,
  Brain,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WordRecommendation, RecommendationEngine } from "@/lib/recommendation-engine";
import { Word } from "@/types/word";

interface SmartRecommendationsProps {
  words: Word[];
  userProgress: {
    learnedWords: string[];
    recentMistakes: string[];
    learningStreak: number;
    proficiencyLevel: string;
  };
  onWordSelect: (wordId: string) => void;
  className?: string;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  words,
  userProgress,
  onWordSelect,
  className
}) => {
  const [recommendations, setRecommendations] = useState<WordRecommendation[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'review'>('learn');

  // Generate recommendations when data changes
  useEffect(() => {
    if (words.length > 0) {
      generateRecommendations();
    }
  }, [words, userProgress]);

  const generateRecommendations = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate API delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newRecommendations = RecommendationEngine.generateRecommendations(
      words,
      userProgress
    );
    
    setRecommendations(newRecommendations);
    setIsRefreshing(false);
  }, [words, userProgress]);

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <TrendingUp className="w-3 h-3" />;
      case 'medium': return <Target className="w-3 h-3" />;
      case 'low': return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <Card className={cn(
      "p-6 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 border border-purple-200/50 backdrop-blur-sm",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
            <p className="text-sm text-gray-600">Personalized based on your learning pattern</p>
          </div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={generateRecommendations}
            disabled={isRefreshing}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
            </motion.div>
            Refresh
          </Button>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        {['learn', 'review'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab as 'learn' | 'review')}
            className={cn(
              "capitalize transition-all duration-200",
              activeTab === tab 
                ? "bg-purple-500 text-white shadow-md" 
                : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
            )}
          >
            {tab === 'learn' ? <Brain className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {tab} Words
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {isRefreshing && (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Recommendations List */}
      {!isRefreshing && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {recommendations.slice(0, 5).map((rec, index) => (
              <motion.div
                key={rec.word.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => onWordSelect(rec.word.id)}
              >
                <div className="p-4 bg-white/70 rounded-xl border border-gray-200/50 hover:border-purple-300/50 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 text-lg">
                            {rec.word.original}
                          </span>
                          <span className="text-sm text-gray-600">
                            {rec.word.translation}
                          </span>
                        </div>
                        
                        <Badge 
                          variant="secondary"
                          className={cn("text-xs border", getPriorityColor(rec.priority))}
                        >
                          {getPriorityIcon(rec.priority)}
                          <span className="ml-1">{rec.priority}</span>
                        </Badge>
                      </div>
                      
                      {/* Reasons */}
                      <div className="flex flex-wrap gap-1">
                        {rec.reasons.slice(0, 2).map((reason, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full"
                          >
                            <Lightbulb className="w-3 h-3" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Score & Action */}
                    <div className="flex items-center gap-3 text-right">
                      <div className="text-sm">
                        <div className="font-medium text-purple-600">{rec.score}%</div>
                        <div className="text-xs text-gray-500">match</div>
                      </div>
                      
                      <motion.div
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {recommendations.length === 0 && !isRefreshing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No recommendations available</p>
              <p className="text-sm text-gray-500">
                Learn more words to get personalized recommendations
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* View All Button */}
      {recommendations.length > 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-gray-200/50"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            View All {recommendations.length} Recommendations
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </Card>
  );
};

export default SmartRecommendations;