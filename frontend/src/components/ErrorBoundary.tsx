'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { WarningOctagon, ArrowClockwise, House } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Here you could send the error to a logging service like Sentry
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-danger-500/10 flex items-center justify-center mb-4">
                <WarningOctagon className="w-10 h-10 text-danger-400" weight="fill" />
              </div>
              <h2 className="text-2xl font-bold text-surface-100 mb-2">
                Something went wrong
              </h2>
              <p className="text-surface-400">
                An unexpected error occurred. Please try again or contact support if the problem persists.
              </p>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-surface-900/50 rounded-xl border border-surface-700">
                <p className="text-sm text-surface-500 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={this.handleRetry}
                leftIcon={<ArrowClockwise className="w-5 h-5" />}
              >
                Try again
              </Button>
              <Button
                variant="ghost"
                onClick={() => (window.location.href = '/')}
                leftIcon={<House className="w-5 h-5" />}
              >
                Go home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


