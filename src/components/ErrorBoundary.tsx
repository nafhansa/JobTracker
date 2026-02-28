"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Something went wrong
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Error:</h3>
                  <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
                    {this.state.error?.toString() || "Unknown error"}
                  </p>
                </div>

                {this.state.errorInfo && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-primary font-medium mb-2">
                      Show stack trace
                    </summary>
                    <pre className="bg-muted p-3 rounded overflow-x-auto text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}

                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
