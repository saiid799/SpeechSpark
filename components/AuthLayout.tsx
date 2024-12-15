// File: components/AuthLayout.tsx

import React from "react";
import Image from "next/image";
import { Globe, Users, Zap } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Decorative Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 justify-center items-center p-12">
        <div className="max-w-md text-center">
          <Image
            src="/images/logo3.png"
            alt="SpeechSpark Logo"
            width={120}
            height={120}
            className="mx-auto mb-8"
          />
          <h1 className="text-4xl font-bold text-foreground mb-6">
            SpeechSpark
          </h1>
          <p className="text-xl text-foreground/80 mb-8">
            Revolutionize your language learning journey with AI-powered
            conversations.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <FeatureIcon icon={Globe} text="Learn any language" />
            <FeatureIcon icon={Users} text="Practice with AI" />
            <FeatureIcon icon={Zap} text="Rapid progress" />
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/images/logo3.png"
              alt="SpeechSpark Logo"
              width={80}
              height={80}
              className="mx-auto mb-4 lg:hidden"
            />
            <h1 className="text-3xl font-bold text-foreground lg:hidden">
              SpeechSpark
            </h1>
          </div>
          <div className="bg-card/30 backdrop-blur-sm shadow-xl rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-center text-foreground mb-6">
              {title}
            </h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureIcon: React.FC<{ icon: React.ElementType; text: string }> = ({
  icon: Icon,
  text,
}) => (
  <div className="flex flex-col items-center">
    <div className="bg-primary/10 p-3 rounded-full mb-2">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <span className="text-sm text-foreground/80">{text}</span>
  </div>
);

export default AuthLayout;
