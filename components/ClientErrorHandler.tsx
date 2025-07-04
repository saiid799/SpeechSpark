"use client";

import { useEffect } from "react";

export default function ClientErrorHandler() {
  useEffect(() => {
    // Handle chunk loading errors globally
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      
      // Check if it's a chunk loading error
      if (
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('fetch') ||
        event.message?.includes('Loading chunk')
      ) {
        console.warn('Chunk loading error detected, reloading page...');
        window.location.reload();
        return;
      }
    };

    // Handle unhandled promise rejections (often caused by chunk failures)
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('fetch')
      ) {
        console.warn('Promise rejection due to chunk loading error, reloading page...');
        event.preventDefault();
        window.location.reload();
        return;
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}