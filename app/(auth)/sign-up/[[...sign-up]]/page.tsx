import { SignUp } from "@clerk/nextjs";
import AuthLayout from "@/components/AuthLayout";

export default function SignUpPage() {
  return (
    <AuthLayout title="Join SpeechSpark">
      <div className="space-y-4">
        {/* Compact welcome message */}
        <div className="text-center space-y-2 mb-4">
          <div className="flex items-center justify-center space-x-2 text-primary">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs font-medium uppercase tracking-wider">Start Learning</span>
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-foreground/60">
            Master languages with AI-powered personalization
          </p>
        </div>

        {/* Compact benefits */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 text-center">
            <div className="text-sm mb-1">🎯</div>
            <p className="text-xs text-foreground/70 font-medium">Personal</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/5 border border-secondary/10 text-center">
            <div className="text-sm mb-1">⚡</div>
            <p className="text-xs text-foreground/70 font-medium">AI-Powered</p>
          </div>
          <div className="p-2 rounded-lg bg-accent/5 border border-accent/10 text-center">
            <div className="text-sm mb-1">🌍</div>
            <p className="text-xs text-foreground/70 font-medium">Global</p>
          </div>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full !flex !flex-col !items-center !justify-center",
              card: "bg-transparent shadow-none w-full !flex !flex-col !items-center !justify-center",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "bg-gradient-to-r from-primary/30 via-card/80 to-secondary/30 hover:from-primary/40 hover:via-card/90 hover:to-secondary/40 text-foreground border-2 border-primary/50 hover:border-primary/70 transition-all duration-300 rounded-xl font-semibold shadow-lg hover:shadow-2xl py-4 px-6 mb-6 !w-full !flex !items-center !justify-center !gap-4 !text-lg !text-center !mx-auto !block !relative transform hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] backdrop-blur-sm",
              socialButtonsBlockButtonText: "font-semibold !text-center !block !w-full !text-lg text-foreground",
              socialButtons: "!flex !flex-col !gap-4 !mb-8 !w-full !items-center !justify-center",
              socialButtonsProviderIcon: "!w-6 !h-6 !flex-shrink-0 !mx-0 filter brightness-125 drop-shadow-sm",
              socialButtonsBlock: "!w-full !flex !flex-col !items-center !justify-center",
              formButtonPrimary:
                "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white transition-all duration-300 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] py-2.5",
              footerActionLink: "text-primary hover:text-primary/80 font-medium transition-colors duration-200",
              formField: "mb-4",
              formFieldInput:
                "bg-background/60 backdrop-blur-sm border-foreground/10 focus:border-primary/50 focus:ring focus:ring-primary/20 transition-all duration-300 rounded-lg px-3 py-2.5 font-medium",
              identityPreviewEditButton: "text-primary hover:text-primary/80 transition-colors duration-200",
              formFieldLabel: "text-foreground/80 font-semibold mb-1.5",
              otpCodeFieldInput: "!bg-background/60 !border-foreground/10 !rounded-lg",
              formFieldAction: "text-primary hover:text-primary/80 font-medium text-sm",
              formFieldSuccessText: "text-green-600 text-sm",
              formFieldErrorText: "text-red-500 font-medium text-sm",
              dividerRow: "text-foreground/40 my-6",
              dividerText: "text-foreground/60 font-medium text-sm px-4",
              dividerLine: "bg-foreground/10",
              footer: "hidden",
              formResendCodeLink: "text-primary hover:text-primary/80 font-medium text-sm",
              alternativeMethodsBlockButton: "text-primary hover:text-primary/80 border-primary/20 hover:border-primary/30 transition-all duration-200 text-sm",
            },
            layout: {
              socialButtonsPlacement: "top",
              socialButtonsVariant: "blockButton",
            },
          }}
          redirectUrl="/onboarding"
        />

        {/* Dynamic growth indicators */}
        <div className="text-center pt-4 border-t border-foreground/10">
          <p className="text-xs text-foreground/50 mb-2">Start your journey today</p>
          <div className="flex justify-center items-center space-x-3 text-foreground/40">
            <div className="flex items-center space-x-1">
              <span className="text-primary text-xs animate-pulse">🚀</span>
              <span className="text-xs font-medium">Early Access</span>
            </div>
            <div className="w-1 h-1 bg-foreground/30 rounded-full"></div>
            <span className="text-xs font-medium">2.1K+ Learners</span>
            <div className="w-1 h-1 bg-foreground/30 rounded-full"></div>
            <span className="text-xs font-medium">15 Languages</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
