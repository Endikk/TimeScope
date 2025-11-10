/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 * Implements best practices for error handling in React applications
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Optional fallback UI to display on error */
  fallback?: ReactNode;
  /** Callback function to log errors to external service */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that was caught */
  error: Error | null;
  /** Additional error information from React */
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary class component that catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire application
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Static method called when an error is thrown in a child component
   * Updates state to trigger fallback UI rendering
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called after an error is caught
   * Used for logging error information
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Call optional error callback (for error reporting services like Sentry)
    this.props.onError?.(error, errorInfo);

    this.setState({ errorInfo });
  }

  /**
   * Resets the error boundary state and attempts to recover
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Reloads the current page
   */
  handleReload = (): void => {
    window.location.reload();
  };

  /**
   * Navigates to home page
   */
  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {import.meta.env.DEV && error && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Error Details (Development Only):</h3>
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-48">
                    <pre className="text-xs text-muted-foreground">
                      <code>{error.toString()}</code>
                    </pre>
                  </div>
                  {errorInfo && (
                    <details className="bg-muted p-4 rounded-md overflow-auto max-h-48">
                      <summary className="cursor-pointer text-xs font-semibold mb-2">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-muted-foreground">
                        <code>{errorInfo.componentStack}</code>
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={this.handleReset} variant="outline" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome} variant="default" className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 * Use this when you need error boundaries in hooks
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}

export default ErrorBoundary;
