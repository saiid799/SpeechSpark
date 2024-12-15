"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  BookOpen,
  Headphones,
  VideoIcon,
  Globe,
  Gamepad,
  BookMarked,
  Filter,
  GraduationCap,
  MessageCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

// Resource type definition
interface Resource {
  id: string;
  title: string;
  description: string;
  type: "video" | "audio" | "reading" | "game" | "tool" | "course";
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  tags: string[];
  icon: React.ElementType;
  url?: string;
  imageUrl?: string;
}

// Sample resources data
const sampleResources: Resource[] = [
  {
    id: "1",
    title: "Basic Conversation Patterns",
    description:
      "Learn essential conversation patterns for everyday situations.",
    type: "video",
    level: "A1",
    tags: ["conversation", "basics", "speaking"],
    icon: VideoIcon,
    url: "#",
  },
  {
    id: "2",
    title: "Pronunciation Practice",
    description: "Master proper pronunciation with audio exercises.",
    type: "audio",
    level: "A2",
    tags: ["pronunciation", "speaking", "listening"],
    icon: Headphones,
    url: "#",
  },
  {
    id: "3",
    title: "Daily Reading Materials",
    description: "Short stories and articles for daily practice.",
    type: "reading",
    level: "B1",
    tags: ["reading", "comprehension", "vocabulary"],
    icon: BookOpen,
    url: "#",
  },
  {
    id: "4",
    title: "Language Learning Games",
    description:
      "Fun and interactive games to practice vocabulary and grammar.",
    type: "game",
    level: "A1",
    tags: ["games", "vocabulary", "practice"],
    icon: Gamepad,
    url: "#",
  },
  {
    id: "5",
    title: "Grammar Exercises",
    description: "Comprehensive grammar practice with examples.",
    type: "tool",
    level: "B2",
    tags: ["grammar", "practice", "exercises"],
    icon: BookMarked,
    url: "#",
  },
  {
    id: "6",
    title: "Cultural Insights",
    description: "Learn about the culture and customs of native speakers.",
    type: "course",
    level: "C1",
    tags: ["culture", "advanced", "learning"],
    icon: Globe,
    url: "#",
  },
];

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredResources = sampleResources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesLevel =
      selectedLevel === "all" || resource.level === selectedLevel;
    const matchesType =
      selectedType === "all" || resource.type === selectedType;

    return matchesSearch && matchesLevel && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-background via-background/95 to-primary/10 p-8 rounded-xl border border-foreground/10">
        <h1 className="text-4xl font-bold mb-2">
          Learning{" "}
          <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            Resources
          </span>
        </h1>
        <p className="text-muted-foreground">
          Discover a variety of materials to enhance your language learning
          journey
        </p>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResourceCategory
          title="Video Lessons"
          icon={VideoIcon}
          count={filteredResources.filter((r) => r.type === "video").length}
          onClick={() => setSelectedType("video")}
          isSelected={selectedType === "video"}
        />
        <ResourceCategory
          title="Audio Materials"
          icon={Headphones}
          count={filteredResources.filter((r) => r.type === "audio").length}
          onClick={() => setSelectedType("audio")}
          isSelected={selectedType === "audio"}
        />
        <ResourceCategory
          title="Reading Practice"
          icon={BookOpen}
          count={filteredResources.filter((r) => r.type === "reading").length}
          onClick={() => setSelectedType("reading")}
          isSelected={selectedType === "reading"}
        />
      </div>

      {/* Search and Filter Section */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 rounded-md border bg-background"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              aria-label="Select proficiency level"
            >
              <option value="all">All Levels</option>
              <option value="A1">Level A1</option>
              <option value="A2">Level A2</option>
              <option value="B1">Level B1</option>
              <option value="B2">Level B2</option>
              <option value="C1">Level C1</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedLevel("all");
                setSelectedType("all");
                setSearchQuery("");
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {/* Quick Links */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Access Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLink
            title="AI Tutor"
            icon={Sparkles}
            description="Practice with AI-powered conversations"
          />
          <QuickLink
            title="Dictionary"
            icon={BookMarked}
            description="Look up words and phrases"
          />
          <QuickLink
            title="Grammar Guide"
            icon={GraduationCap}
            description="Essential grammar rules and examples"
          />
          <QuickLink
            title="Community"
            icon={MessageCircle}
            description="Connect with other learners"
          />
        </div>
      </Card>
    </div>
  );
};

interface ResourceCategoryProps {
  title: string;
  icon: React.ElementType;
  count: number;
  onClick: () => void;
  isSelected: boolean;
}

const ResourceCategory: React.FC<ResourceCategoryProps> = ({
  title,
  icon: Icon,
  count,
  onClick,
  isSelected,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`cursor-pointer p-6 rounded-xl transition-all duration-300 ${
      isSelected
        ? "bg-primary/20 border-primary"
        : "bg-card hover:bg-primary/10"
    } border`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-6 h-6 text-primary" />
      <span className="text-sm text-muted-foreground">{count} items</span>
    </div>
    <h3 className="font-semibold">{title}</h3>
  </motion.div>
);

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => (
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
    className="group"
  >
    <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <resource.icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/10 text-secondary">
          Level {resource.level}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
        {resource.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {resource.description}
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {resource.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 rounded-full bg-primary/5 text-primary"
          >
            {tag}
          </span>
        ))}
      </div>
      {resource.url && (
        <Button className="w-full group" variant="outline">
          Access Resource
          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      )}
    </Card>
  </motion.div>
);

interface QuickLinkProps {
  title: string;
  icon: React.ElementType;
  description: string;
}

const QuickLink: React.FC<QuickLinkProps> = ({
  title,
  icon: Icon,
  description,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
  >
    <Icon className="w-5 h-5 text-primary mb-2" />
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);

export default Resources;
