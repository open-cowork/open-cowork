"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/errors";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Extend ErrorInfo to include Next.js's digest property
interface NextJSErrorInfo extends React.ErrorInfo {
  digest?: string;
}

// Type declaration for import.meta.env
declare global {
  interface ImportMetaEnv {
    readonly DEV: boolean;
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly PROD: boolean;
    readonly SSR: boolean;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    const nextJsInfo = errorInfo as NextJSErrorInfo;
    logError(error, {
      componentStack: errorInfo.componentStack,
      digest: nextJsInfo.digest,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <div className="flex max-w-md flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>

            <h2 className="mb-2 text-2xl font-semibold tracking-tight">
              Something went wrong
            </h2>

            <p className="mb-6 text-sm text-muted-foreground">
              {this.state.error?.message ||
                "An unexpected error occurred. Please try again."}
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 w-full rounded-lg bg-muted p-4 text-left">
                <summary className="mb-2 cursor-pointer font-mono text-sm font-semibold">
                  Error Details
                </summary>
                <pre className="overflow-auto text-xs">
                  <code>
                    {this.state.error.toString()}
                    {"\n"}
                    {this.state.errorInfo?.componentStack}
                  </code>
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based Error Boundary for functional components
 * Note: This is a wrapper around the class component for convenience
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
