"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Lock } from "lucide-react";

interface BatchInfo {
  batchNumber: number;
  totalWords: number;
  learnedWords: number;
  progress: number;
  isCompleted: boolean;
  isAvailable: boolean;
  isCurrent: boolean;
}

interface BatchNavigatorProps {
  batches: BatchInfo[];
  currentBatch: number;
  onBatchChange: (batchNumber: number) => void;
  className?: string;
}

const BatchNavigator: React.FC<BatchNavigatorProps> = ({
  batches,
  currentBatch,
  onBatchChange,
  className = "",
}) => {
  const availableBatches = batches.filter(batch => batch.isAvailable);
  const currentBatchIndex = availableBatches.findIndex(batch => batch.batchNumber === currentBatch);

  const handlePrevBatch = () => {
    if (currentBatchIndex > 0) {
      const prevBatch = availableBatches[currentBatchIndex - 1];
      onBatchChange(prevBatch.batchNumber);
    }
  };

  const handleNextBatch = () => {
    if (currentBatchIndex < availableBatches.length - 1) {
      const nextBatch = availableBatches[currentBatchIndex + 1];
      onBatchChange(nextBatch.batchNumber);
    }
  };

  const canGoPrev = currentBatchIndex > 0;
  const canGoNext = currentBatchIndex < availableBatches.length - 1;

  return (
    <div className={`bg-card/50 backdrop-blur-sm border border-foreground/10 rounded-xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Learning Progress</h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Batch {currentBatch}
        </Badge>
      </div>

      {/* Current Batch Progress */}
      <div className="mb-6">
        {availableBatches.map(batch => {
          if (batch.batchNumber === currentBatch) {
            return (
              <div key={batch.batchNumber} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Batch Progress</span>
                  <span>{batch.learnedWords}/{batch.totalWords} words</span>
                </div>
                <Progress value={batch.progress} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">
                  {batch.progress}% completed
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Batch Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {batches.slice(0, 10).map(batch => (
          <Button
            key={batch.batchNumber}
            variant={batch.isCurrent ? "default" : batch.isCompleted ? "secondary" : "outline"}
            size="sm"
            className={`relative h-12 ${
              !batch.isAvailable ? "opacity-50 cursor-not-allowed" : ""
            } ${batch.isCurrent ? "ring-2 ring-primary" : ""}`}
            onClick={() => batch.isAvailable && onBatchChange(batch.batchNumber)}
            disabled={!batch.isAvailable}
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                {batch.isCompleted ? (
                  <CheckCircle className="w-3 h-3" />
                ) : batch.isAvailable ? (
                  <Circle className="w-3 h-3" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
                <span className="text-xs">{batch.batchNumber}</span>
              </div>
              {batch.totalWords > 0 && (
                <div className="text-[10px] opacity-70">
                  {batch.learnedWords}/{batch.totalWords}
                </div>
              )}
            </div>
          </Button>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevBatch}
          disabled={!canGoPrev}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Batch
        </Button>

        <div className="text-sm text-muted-foreground">
          {availableBatches.length} of {batches.length} batches available
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextBatch}
          disabled={!canGoNext}
          className="flex items-center gap-2"
        >
          Next Batch
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Batch Summary */}
      <div className="mt-4 pt-4 border-t border-foreground/10">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-green-600">
              {batches.filter(b => b.isCompleted).length}
            </div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="font-semibold text-blue-600">
              {batches.filter(b => b.isAvailable && !b.isCompleted).length}
            </div>
            <div className="text-muted-foreground">In Progress</div>
          </div>
          <div>
            <div className="font-semibold text-gray-500">
              {batches.filter(b => !b.isAvailable).length}
            </div>
            <div className="text-muted-foreground">Locked</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchNavigator;