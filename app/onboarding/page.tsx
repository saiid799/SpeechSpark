import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import UserQuestionnaire from "@/components/UserQuestionnaire";
import { ApiError, handleApiError } from "@/lib/api-error";

export default async function OnboardingPage() {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    return <UserQuestionnaire />;
  } catch (error) {
    const { statusCode, message } = handleApiError(error);

    if (statusCode === 401) {
      redirect("/sign-in");
    }

    throw new Error(`Error in OnboardingPage: ${message}`);
  }
}
