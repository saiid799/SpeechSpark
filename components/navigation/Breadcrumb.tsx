// File: components/navigation/Breadcrumb.tsx

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  const router = useRouter();

  const handleNavigation = (href: string) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center"
          >
            {item.href && !isLast ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item.href!)}
                className="flex items-center gap-1 h-auto p-1 hover:text-primary transition-colors"
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </Button>
            ) : (
              <div className={`flex items-center gap-1 ${isLast ? "text-foreground font-medium" : ""}`}>
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </div>
            )}
            
            {!isLast && (
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/50" />
            )}
          </motion.div>
        );
      })}
    </motion.nav>
  );
};

export default Breadcrumb;