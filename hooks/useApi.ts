// File: hooks/useApi.ts

import { useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { requestCache, createCacheKey, withTimeout } from "@/lib/request-cache";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  statusCode?: number;
}

interface ApiError extends Error {
  status?: number;
}

interface ApiOptions extends Omit<RequestInit, 'cache'> {
  dedupe?: boolean;
  cache?: boolean;
  timeout?: number;
  ttl?: number;
  showErrorToast?: boolean;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  // Track current request to prevent race conditions
  const currentRequestRef = useRef<string | null>(null);

  const request = useCallback(
    async (url: string, options: ApiOptions = {}): Promise<void> => {
      const {
        dedupe = true,
        cache = true,
        timeout = 15000, // 15 seconds timeout
        ttl = 2 * 60 * 1000, // 2 minutes default TTL
        showErrorToast = true,
        ...requestOptions
      } = options;

      // Create unique request ID to prevent race conditions
      const requestId = Math.random().toString(36);
      currentRequestRef.current = requestId;

      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
      
      try {
        const cacheKey = createCacheKey(url, {
          method: requestOptions.method || 'GET',
          body: requestOptions.body?.toString(),
        });

        const makeRequest = async (): Promise<T> => {
          const response = await fetch(url, {
            headers: {
              "Content-Type": "application/json",
              ...requestOptions?.headers,
            },
            ...requestOptions,
          });

          if (!response.ok) {
            if (response.status === 429) {
              throw new Error("Rate limit exceeded. Please try again in a minute.");
            }
            
            const errorData = await response.json().catch(() => ({ 
              error: `HTTP error! status: ${response.status}` 
            }));
            
            const error = new Error(
              errorData.error || `HTTP error! status: ${response.status}`
            ) as ApiError;
            error.status = response.status;
            throw error;
          }

          return response.json();
        };

        let data: T;

        if (dedupe && cache && requestOptions.method !== 'POST') {
          // Use request deduplication and caching for GET requests
          data = await requestCache.dedupe(
            cacheKey,
            () => withTimeout(makeRequest(), timeout),
            ttl
          );
        } else {
          // Direct request without caching for POST requests
          data = await withTimeout(makeRequest(), timeout);
        }

        // Only update state if this is still the current request
        if (currentRequestRef.current === requestId) {
          setState({ data, error: null, isLoading: false });
        }
      } catch (error) {
        // Only update state if this is still the current request
        if (currentRequestRef.current === requestId) {
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
          
          if (showErrorToast) {
            toast.error(errorMessage);
          }
        }
        
        throw error;
      }
    },
    []
  );

  // Add a reset function to clear state
  const reset = useCallback(() => {
    currentRequestRef.current = null;
    setState({
      data: null,
      error: null,
      isLoading: false,
    });
  }, []);

  return { ...state, request, reset };
}
