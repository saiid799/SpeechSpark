// File: components/dashboard/Sidebar.tsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MessageCircle,
  BarChart3,
  Layers,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Zap,
  UserPlus,
  LogIn,
} from "lucide-react";
import { UserButton, useAuth, useClerk } from "@clerk/nextjs";

const sidebarLinks = [
  { icon: Home, text: "Dashboard", href: "/dashboard" },
  { icon: MessageCircle, text: "Practice", href: "/practice" },
  { icon: BarChart3, text: "Progress", href: "/progress" },
  { icon: Layers, text: "Resources", href: "/resources" },
  { icon: Settings, text: "Settings", href: "/settings" },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isLoaded, userId } = useAuth();
  const { signOut } = useClerk();
  const isSignedIn = !!userId;

  return (
    <div className="w-64 bg-card/95 backdrop-blur-xl border-r border-foreground/5 h-screen fixed left-0 top-0 overflow-y-auto shadow-2xl shadow-black/10">
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="p-6 border-b border-foreground/5">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300">
                <Image
                  src="/images/logo3.png"
                  alt="SpeechSpark Logo"
                  width={24}
                  height={24}
                  className="object-cover filter brightness-0 invert"
                />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground font-display group-hover:text-primary transition-colors duration-300">
                SpeechSpark
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Language Learning
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-4 py-6">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Main Menu
            </h3>
            <nav className="space-y-1">
              {sidebarLinks.map((link, index) => (
                <SidebarLink
                  key={link.href}
                  {...link}
                  isActive={pathname === link.href}
                  index={index}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-foreground/5 bg-background/30">
          {isLoaded && isSignedIn ? (
            // Authenticated user footer
            <div className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-foreground/5">
              <div className="flex items-center space-x-3">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopoverCard: "bg-card border-foreground/10",
                      userButtonPopoverActionButton: "text-foreground hover:bg-primary/10"
                    }
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Profile</span>
                  <span className="text-xs text-muted-foreground">Manage account</span>
                </div>
              </div>
              <motion.button
                onClick={() => signOut(() => {
                  window.location.href = "/";
                })}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200 group"
                title="Sign out"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              </motion.button>
            </div>
          ) : (
            // Non-authenticated user footer with sign-up button
            <div className="space-y-3">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
                <div className="mb-3">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-foreground">Join SpeechSpark</h3>
                  <p className="text-xs text-muted-foreground">Start your language journey</p>
                </div>
                
                {/* Modern Sign Up Button */}
                <Link href="/sign-up">
                  <SidebarSignUpButton />
                </Link>
              </div>
              
              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Already have an account?</p>
                <Link 
                  href="/sign-in"
                  className="inline-flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  text: string;
  isActive: boolean;
  index: number;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  icon: Icon,
  text,
  isActive,
  index,
}) => {
  const [isClicked, setIsClicked] = React.useState(false);

  const handleClick = () => {
    setIsClicked(true);
    // Reset after navigation completes
    setTimeout(() => setIsClicked(false), 500);
  };

  return (
    <Link 
      href={href} 
      className="block" 
      prefetch={true}
      onClick={handleClick}
    >
      <motion.div
        className={`relative flex items-center space-x-3 px-4 py-3.5 mx-2 rounded-2xl group transition-all duration-200 ${
          isActive
            ? "bg-primary text-white shadow-lg shadow-primary/30"
            : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
        } ${isClicked ? "scale-[0.98]" : ""}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.2 }}
        whileHover={{ 
          x: isActive ? 0 : 4,
          transition: { duration: 0.15 }
        }}
        whileTap={{ 
          scale: 0.96,
          transition: { duration: 0.1 }
        }}
      >
        {/* Icon container */}
        <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
          isActive 
            ? "bg-white/20 text-white shadow-sm" 
            : "text-foreground/60 group-hover:bg-primary/10 group-hover:text-primary"
        }`}>
          <Icon className={`h-5 w-5 transition-all duration-200 ${
            isActive ? "scale-100" : "group-hover:scale-110"
          }`} />
        </div>
        
        {/* Text */}
        <span className={`font-semibold text-sm transition-all duration-200 ${
          isActive ? "text-white" : "text-foreground/80 group-hover:text-foreground"
        }`}>
          {text}
        </span>
        
        {/* Modern active indicator - dot */}
        {isActive && (
          <motion.div
            className="ml-auto w-2 h-2 bg-white rounded-full shadow-sm"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 400 }}
          />
        )}
        
        {/* Loading indicator for clicked state */}
        {isClicked && !isActive && (
          <motion.div
            className="ml-auto w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.1 }}
          />
        )}
        
        {/* Chevron for inactive items */}
        {!isActive && !isClicked && (
          <ChevronRight className="ml-auto h-4 w-4 text-foreground/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
        )}
        
        {/* Background glow effect for hover */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
          isActive 
            ? "bg-gradient-to-r from-white/5 to-transparent" 
            : "bg-gradient-to-r from-primary/5 to-transparent"
        }`} />
        
        {/* Click ripple effect */}
        {isClicked && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary/20"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </motion.div>
    </Link>
  );
};

const SidebarSignUpButton: React.FC = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
  };

  return (
    <motion.div
      className="relative group w-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      {/* Background with gradient and glow */}
      <div className="relative overflow-hidden rounded-xl w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-secondary opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
        
        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/40 to-secondary/40 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"
          animate={{
            scale: isHovered ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
        
        {/* Main button content */}
        <div className="relative flex items-center justify-center px-4 py-3 text-white font-semibold text-sm w-full">
          {/* Sparkle animation */}
          <AnimatePresence>
            {isHovered && (
              <>
                <motion.div
                  className="absolute left-3 top-2"
                  initial={{ opacity: 0, scale: 0, rotate: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 0.8, 0], 
                    rotate: [0, 180, 360] 
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-white/80" />
                </motion.div>
                
                <motion.div
                  className="absolute right-3 bottom-2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    rotate: [0, 90, 180] 
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                >
                  <Zap className="w-2 h-2 text-yellow-300" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          {/* Icon and text container */}
          <div className="flex items-center space-x-2 relative z-10">
            <motion.div
              animate={{
                rotate: isClicked ? [0, 15, -15, 0] : 0,
              }}
              transition={{ duration: 0.6 }}
            >
              <UserPlus className="w-4 h-4" />
            </motion.div>
            
            <span className="relative text-sm">
              Sign Up Free
              {/* Underline animation */}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-white/60"
                initial={{ width: 0 }}
                animate={{ width: isHovered ? "100%" : 0 }}
                transition={{ duration: 0.3 }}
              />
            </span>
            
            <motion.div
              animate={{
                x: isHovered ? [0, 3, 0] : 0,
              }}
              transition={{
                duration: 1.5,
                repeat: isHovered ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.div>
          </div>
          
          {/* Click ripple effect */}
          <AnimatePresence>
            {isClicked && (
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-xl"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
            animate={{
              x: isHovered ? ["-200%", "200%"] : "-200%",
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
          />
        </div>
        
        {/* Border highlight */}
        <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/40 transition-colors duration-300" />
      </div>
      
      {/* Floating particles effect */}
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 bg-primary/60 rounded-full"
                style={{
                  left: `${25 + i * 20}%`,
                  top: `${15 + (i % 2) * 70}%`,
                }}
                initial={{ opacity: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-15, -30],
                  scale: [0, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Sidebar;
