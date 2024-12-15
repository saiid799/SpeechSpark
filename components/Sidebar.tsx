import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  MessageCircle,
  BarChart3,
  Layers,
  Settings,
  LogOut,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const sidebarLinks = [
  { icon: Home, text: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, text: "Lessons", href: "/lessons" },
  { icon: MessageCircle, text: "Practice", href: "/practice" },
  { icon: BarChart3, text: "Progress", href: "/progress" },
  { icon: Layers, text: "Resources", href: "/resources" },
  { icon: Settings, text: "Settings", href: "/settings" },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-background/50 backdrop-blur-md border-r border-foreground/10 h-screen fixed left-0 top-0 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <Image
              src="/images/logo3.png"
              alt="SpeechSpark Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-xl font-bold text-primary">SpeechSpark</span>
          </div>
          <nav className="space-y-1">
            {sidebarLinks.map((link) => (
              <SidebarLink
                key={link.href}
                {...link}
                isActive={pathname === link.href}
              />
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-foreground/10">
          <div className="flex items-center justify-between">
            <UserButton afterSignOutUrl="/" />
            <Link
              href="/api/auth/signout"
              className="flex items-center space-x-2 text-foreground/60 hover:text-primary transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign out</span>
            </Link>
          </div>
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
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  icon: Icon,
  text,
  isActive,
}) => (
  <Link href={href} className="block">
    <motion.div
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-foreground/60 hover:bg-primary/5 hover:text-primary"
      }`}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="h-5 w-5" />
      <span>{text}</span>
    </motion.div>
  </Link>
);

export default Sidebar;
