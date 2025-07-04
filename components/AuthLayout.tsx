// File: components/AuthLayout.tsx

import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Decorative Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 justify-center items-center p-8 relative overflow-hidden">
        {/* Modern geometric background */}
        <div className="absolute inset-0">
          {/* Large gradient orbs - reduced size */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-primary/25 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-secondary/20 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-accent/15 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Main content - optimized for viewport */}
        <div className="max-w-sm text-center relative z-20 space-y-6">
          {/* Compact logo section */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/15 via-secondary/15 to-accent/15 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-card/15 to-card/5 backdrop-blur-sm rounded-2xl p-6 border border-primary/15">
              <Image
                src="/images/logo3.png"
                alt="SpeechSpark Logo"
                width={60}
                height={60}
                className="mx-auto mb-3 drop-shadow-xl filter brightness-110"
              />
              <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                SpeechSpark
              </h1>
              <p className="text-xs text-primary/70 font-medium uppercase tracking-wider">
                AI Language Learning
              </p>
            </div>
          </div>

          {/* Compact feature grid */}
          <div className="grid grid-cols-2 gap-3">
            <CompactFeature icon="🚀" title="AI Powered" />
            <CompactFeature icon="🌍" title="95+ Languages" />
            <CompactFeature icon="🎯" title="Smart Tracking" />
            <CompactFeature icon="💬" title="Real Practice" />
          </div>

          {/* Dynamic stats with live indicators */}
          <div className="bg-gradient-to-r from-primary/8 to-secondary/8 backdrop-blur-sm rounded-xl p-4 border border-primary/15">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="group cursor-pointer">
                <div className="text-lg font-bold text-primary group-hover:scale-110 transition-transform duration-300">2.1K+</div>
                <div className="text-xs text-foreground/60">Active Users</div>
                <div className="w-full bg-primary/10 rounded-full h-1 mt-1">
                  <div className="bg-primary h-1 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-lg font-bold text-secondary group-hover:scale-110 transition-transform duration-300">15+</div>
                <div className="text-xs text-foreground/60">Languages</div>
                <div className="text-xs text-secondary/60 mt-1">Growing Daily</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-lg font-bold text-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-green-500 mr-1 animate-pulse">●</span>Beta
                </div>
                <div className="text-xs text-foreground/60">Live Now</div>
                <div className="text-xs text-accent/60 mt-1">Join Early</div>
              </div>
            </div>
          </div>

          {/* Authentic tagline */}
          <p className="text-sm text-foreground/70 leading-relaxed">
            Join early adopters learning smarter with AI
          </p>
        </div>
        
        {/* Reduced floating elements */}
        <div className="absolute top-16 left-16 w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full animate-bounce opacity-50" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-32 right-16 w-1.5 h-1.5 bg-gradient-to-r from-secondary to-accent rounded-full animate-bounce opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-16 left-32 w-1.5 h-1.5 bg-gradient-to-r from-accent to-primary rounded-full animate-bounce opacity-60" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="relative mb-3 lg:hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-full blur-lg animate-pulse"></div>
              <Image
                src="/images/logo3.png"
                alt="SpeechSpark Logo"
                width={60}
                height={60}
                className="mx-auto relative z-10 drop-shadow-lg"
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground lg:hidden bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              SpeechSpark
            </h1>
          </div>
          <div className="bg-card/30 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-foreground/10 relative overflow-hidden">
            {/* Card background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 rounded-2xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-center text-foreground mb-4">
                {title}
              </h2>
              {children}
            </div>
            
            {/* Subtle card decoration */}
            <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-br from-primary/8 to-secondary/8 rounded-full blur-xl"></div>
            <div className="absolute bottom-3 left-3 w-10 h-10 bg-gradient-to-tr from-secondary/8 to-accent/8 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompactFeature: React.FC<{ icon: string; title: string }> = ({
  icon,
  title,
}) => (
  <div className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 hover:border-primary/20 transition-all duration-300 group cursor-pointer">
    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center text-lg mb-2 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <span className="text-xs font-medium text-foreground/80 text-center leading-tight group-hover:text-foreground transition-colors duration-300">
      {title}
    </span>
  </div>
);

export default AuthLayout;
