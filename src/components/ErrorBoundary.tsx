'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // You could also log to an error reporting service here
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='flex items-center justify-center min-h-[300px] p-6 bg-muted/40 rounded-lg'>
          <div className='text-center max-w-md'>
            <div className='flex justify-center mb-4'>
              <AlertCircle className='h-12 w-12 text-destructive' />
            </div>
            <h2 className='text-lg font-semibold mb-2'>Something went wrong</h2>
            <p className='text-sm text-muted-foreground mb-4'>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              variant='secondary'
              className='flex items-center gap-2'
              onClick={this.handleReset}
            >
              <RefreshCw className='h-4 w-4' />
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
