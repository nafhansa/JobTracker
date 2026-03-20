import { Feedback, FeedbackType } from "@/types";

export const submitFeedback = async (
  userId: string,
  type: FeedbackType,
  message: string,
  rating?: number
): Promise<{ success: boolean; data?: Feedback; error?: string }> => {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        type,
        message,
        rating,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to submit feedback",
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return {
      success: false,
      error: "Failed to submit feedback. Please try again.",
    };
  }
};