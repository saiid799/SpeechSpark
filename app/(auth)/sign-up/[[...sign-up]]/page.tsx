import { SignUp } from "@clerk/nextjs";
import AuthLayout from "@/components/AuthLayout";

export default function SignUpPage() {
  return (
    <AuthLayout title="Create Your Account">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-transparent shadow-none w-full",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton:
              "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all duration-200",
            formButtonPrimary:
              "bg-primary hover:bg-primary/90 text-white transition-all duration-200",
            footerActionLink: "text-primary hover:text-primary/90",
            formField: "mb-4",
            formFieldInput:
              "bg-background/50 border-foreground/10 focus:border-primary/50 focus:ring focus:ring-primary/20 transition-all duration-200",
            identityPreviewEditButton: "text-primary hover:text-primary/90",
            formFieldLabel: "text-foreground/80",
            otpCodeFieldInput: "!bg-background/50 !border-foreground/10",
          },
        }}
        redirectUrl="/onboarding"
      />
    </AuthLayout>
  );
}
