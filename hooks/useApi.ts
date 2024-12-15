// File: hooks/useApi.ts

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  statusCode?: number;
}

interface ApiError extends Error {
  status?: number;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const request = useCallback(
    async (url: string, options: RequestInit = {}): Promise<void> => {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(
              "Rate limit exceeded. Please try again in a minute."
            );
          }
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }
        const data = await response.json();
        setState({ data, error: null, isLoading: false });
      } catch (error) {
        let errorMessage = "An unexpected error occurred";
        let statusCode: number | undefined;
        if (error instanceof Error) {
          errorMessage = error.message;
          if ("status" in error) {
            statusCode = (error as ApiError).status;
          }
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        setState((prevState) => ({
          ...prevState,
          error: errorMessage,
          isLoading: false,
          statusCode,
        }));
        toast.error(errorMessage);
      }
    },
    []
  );

  return { ...state, request };
}
