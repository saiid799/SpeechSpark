import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Twitter,
  Linkedin,
  Github,
  Youtube,
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-gradient-to-t from-background to-background/80 text-foreground py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent font-display">
                SpeechSpark
              </span>
            </Link>
            <p className="text-sm text-foreground/80 mb-6 max-w-md">
              Revolutionize your language learning journey with AI-powered
              personalized lessons, interactive conversations, and real-time
              progress tracking.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={Twitter} link="#" ariaLabel="Twitter" />
              <SocialIcon icon={Linkedin} link="#" ariaLabel="LinkedIn" />
              <SocialIcon icon={Github} link="#" ariaLabel="GitHub" />
              <SocialIcon icon={Youtube} link="#" ariaLabel="YouTube" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div>
              <h3 className="text-lg font-semibold mb-4 font-display text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <FooterLink
                    href="#how-it-works"
                    onClick={(e) => handleSmoothScroll(e, "how-it-works")}
                  >
                    How It Works
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/about">About</FooterLink>
                </li>
                <li>
                  <FooterLink
                    href="#testimonials"
                    onClick={(e) => handleSmoothScroll(e, "testimonials")}
                  >
                    Testimonials
                  </FooterLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 font-display text-gradient bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <FooterLink href="#faq">FAQ</FooterLink>
                </li>
                <li>
                  <FooterLink href="#contact">Contact Us</FooterLink>
                </li>
                <li>
                  <FooterLink href="#privacy">Privacy Policy</FooterLink>
                </li>
                <li>
                  <FooterLink href="#terms">Terms of Service</FooterLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-foreground/10 mt-12 pt-8 text-center">
          <p className="text-sm text-foreground/60">
            © {currentYear} SpeechSpark. All rights reserved.
          </p>
        </div>
      </div>
      <BackgroundAnimation />
    </footer>
  );
};

const SocialIcon: React.FC<{
  icon: React.ElementType;
  link: string;
  ariaLabel: string;
}> = ({ icon: Icon, link, ariaLabel }) => (
  <motion.a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={ariaLabel}
    className="text-foreground/60 hover:text-primary transition-colors duration-300"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <Icon size={24} />
  </motion.a>
);

const FooterLink: React.FC<{
  href: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}> = ({ href, children, onClick }) => (
  <Link
    href={href}
    className="text-sm text-foreground/80 hover:text-primary transition-colors duration-300"
    onClick={onClick}
  >
    <motion.span
      whileHover={{ x: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {children}
    </motion.span>
  </Link>
);

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <div className="absolute -top-1/2 -left-1/2 w-full h-full">
        <motion.div
          className="w-full h-full bg-gradient-to-br from-primary to-transparent rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <div className="absolute -bottom-1/2 -right-1/2 w-full h-full">
        <motion.div
          className="w-full h-full bg-gradient-to-tl from-secondary to-transparent rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -120, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </div>
  );
};

export default Footer;
