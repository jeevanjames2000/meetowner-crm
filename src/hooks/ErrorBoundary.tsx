import React, { ReactNode, useState } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);


  const handleError = (error: Error) => {
    setHasError(true);
    setError(error);
  };


  try {
    if (hasError) {
      return (
        fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error?.message || "An unexpected error occurred."}
              </p>
              <button
                className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return <>{children}</>;
  } catch (err) {

    handleError(err as Error);
    console.error("Error caught by ErrorBoundary:", err);
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {(err as Error).message || "An unexpected error occurred."}
            </p>
            <button
              className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    );
  }
};

export default ErrorBoundary;