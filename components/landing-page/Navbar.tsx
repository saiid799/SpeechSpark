"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  User,
  MessageCircle,
  LogOut,
  BookOpen,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { UserButton, useClerk } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoaded, userId } = useAuth();
  const isSignedIn = !!userId;
  const pathname = usePathname();
  const { signOut } = useClerk();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "How It Works", href: "/#how-it-works", icon: MessageCircle },
    { name: "About", href: "/about", icon: User },
    { name: "Testimonials", href: "/#testimonials", icon: BookOpen },
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    if (href.startsWith("/#")) {
      const targetId = href.split("#")[1];
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.href = href;
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.div
      className="fixed top-0 z-50 w-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav
        className={`mx-4 my-3 rounded-full transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md shadow-lg"
            : "bg-background/50"
        } border border-foreground/10`}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative overflow-hidden rounded-full shadow-lg transition-transform duration-300 ease-in-out transform group-hover:scale-105">
                <Image
                  src="/images/logo3.png"
                  alt="SpeechSpark Logo"
                  width={40}
                  height={40}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></div>
              </div>
              <span className="text-lg font-bold text-foreground font-display transition-colors duration-300 ease-in-out group-hover:text-primary">
                SpeechSpark
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  icon={item.icon}
                  isActive={pathname === item.href}
                >
                  {item.name}
                </NavItem>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              {isLoaded && isSignedIn ? (
                <>
                  <Link href="/dashboard">
                    <NavButton variant="ghost">Dashboard</NavButton>
                  </Link>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox:
                          "w-10 h-10 rounded-full border-2 border-primary/20 hover:border-primary/50 transition-all duration-300",
                      },
                    }}
                  />
                </>
              ) : (
                <>
                  <Link href="/sign-in">
                    <NavButton variant="ghost">Login</NavButton>
                  </Link>
                  <Link href="/sign-up">
                    <ModernSignUpButton />
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden">
              <button
                className="text-foreground hover:text-primary transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mx-4 mt-2 bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <NavItem
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  icon={item.icon}
                  isActive={pathname === item.href}
                  mobile
                >
                  {item.name}
                </NavItem>
              ))}
              {isLoaded && isSignedIn ? (
                <>
                  <Link href="/dashboard">
                    <NavButton variant="ghost" fullWidth>
                      Dashboard
                    </NavButton>
                  </Link>
                  <div className="flex justify-between items-center">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox:
                            "w-10 h-10 rounded-full border-2 border-primary/20 hover:border-primary/50 transition-all duration-300",
                        },
                      }}
                    />
                    <NavButton
                      variant="ghost"
                      onClick={() =>
                        signOut(() => {
                          window.location.href = "/";
                        })
                      }
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </NavButton>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/sign-in">
                    <NavButton variant="ghost" fullWidth>
                      Login
                    </NavButton>
                  </Link>
                  <Link href="/sign-up">
                    <ModernSignUpButton fullWidth />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NavItem: React.FC<{
  href: string;
  children: React.ReactNode;
  icon: React.ElementType;
  isActive: boolean;
  mobile?: boolean;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}> = ({ href, children, icon: Icon, isActive, mobile, onClick }) => (
  <a
    href={href}
    onClick={(e) => onClick(e, href)}
    className={`cursor-pointer text-sm font-medium ${
      isActive ? "text-primary" : "text-foreground/80 hover:text-primary"
    } transition-colors duration-300 ${mobile ? "block py-2" : "px-3 py-2"}`}
  >
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center"
    >
      <Icon className="mr-2 h-4 w-4" />
      {children}
      {!mobile && <ChevronDown className="ml-1 h-4 w-4 opacity-50" />}
    </motion.span>
  </a>
);

const NavButton: React.FC<{
  variant: "ghost" | "primary";
  children: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
}> = ({ variant, children, fullWidth, onClick }) => (
  <motion.button
    className={`text-sm font-medium rounded-full transition-all duration-300 ${
      variant === "ghost"
        ? "text-foreground/80 hover:text-primary hover:bg-primary/10"
        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
    } ${fullWidth ? "w-full" : ""} px-4 py-2 flex items-center justify-center`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
  >
    {children}
  </motion.button>
);

const ModernSignUpButton: React.FC<{
  fullWidth?: boolean;
}> = ({ fullWidth }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
  };

  return (
    <motion.div
      className={`relative group ${fullWidth ? "w-full" : ""}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      {/* Background with gradient and glow */}
      <div className={`relative overflow-hidden rounded-2xl ${fullWidth ? "w-full" : ""}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-secondary opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
        
        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/50 to-secondary/50 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
          animate={{
            scale: isHovered ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
        
        {/* Main button content */}
        <div className={`relative flex items-center justify-center px-6 py-3 text-white font-semibold text-sm ${fullWidth ? "w-full" : ""}`}>
          {/* Sparkle animation */}
          <AnimatePresence>
            {isHovered && (
              <>
                <motion.div
                  className="absolute left-3 top-2"
                  initial={{ opacity: 0, scale: 0, rotate: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0], 
                    rotate: [0, 180, 360] 
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                >
                  <Sparkles className="w-3 h-3 text-white/80" />
                </motion.div>
                
                <motion.div
                  className="absolute right-4 bottom-2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1.2, 0],
                    rotate: [0, 90, 180] 
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                >
                  <Zap className="w-2.5 h-2.5 text-yellow-300" />
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
              <Sparkles className="w-4 h-4" />
            </motion.div>
            
            <span className="relative">
              Start Learning
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
                x: isHovered ? [0, 4, 0] : 0,
              }}
              transition={{
                duration: 1.5,
                repeat: isHovered ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
          
          {/* Click ripple effect */}
          <AnimatePresence>
            {isClicked && (
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-2xl"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
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
        <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-white/40 transition-colors duration-300" />
      </div>
      
      {/* Floating particles effect */}
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/60 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + (i % 2) * 80}%`,
                }}
                initial={{ opacity: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-20, -40],
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

export default Navbar;
