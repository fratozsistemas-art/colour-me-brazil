import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });

    // TODO: Log error to external service (Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // TODO: Implement error logging service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    const errorData = {
      message: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log('Error logged:', errorData);
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    // TODO: Open bug report modal with pre-filled error details
    const subject = encodeURIComponent(`Error Report: ${this.state.error?.message}`);
    const body = encodeURIComponent(`
Error: ${this.state.error?.toString()}

Stack Trace:
${this.state.error?.stack}

Component Stack:
${this.state.errorInfo?.componentStack}

URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
    `);
    
    window.open(`mailto:bugs@colourmebrazil.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
          <Card className="max-w-2xl w-full p-8">
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600">
                We're sorry for the inconvenience. An unexpected error occurred.
              </p>
            </div>

            {/* User-Friendly Error Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">What happened?</h3>
              <p className="text-sm text-red-700">
                {error?.message || 'An unexpected error occurred in the application.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <Button
                onClick={this.handleReset}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </Button>
              <Button
                onClick={this.handleReportBug}
                variant="outline"
                className="gap-2"
              >
                <Bug className="w-4 h-4" />
                Report Bug
              </Button>
            </div>

            {/* Tips for Users */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">What you can do:</h3>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Click "Try Again" to reload this component</li>
                <li>Click "Reload Page" to refresh the entire page</li>
                <li>Click "Go to Home" to return to the main page</li>
                <li>If the problem persists, please report the bug</li>
              </ul>
            </div>

            {/* Error Count Warning */}
            {errorCount > 1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This error has occurred {errorCount} times.
                  If it continues, please try clearing your browser cache or contact support.
                </p>
              </div>
            )}

            {/* Technical Details (Development Only or Expandable) */}
            {isDevelopment && (
              <details className="mt-6">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                  Technical Details (Development)
                </summary>
                <div className="bg-gray-100 rounded-lg p-4 text-xs font-mono overflow-auto max-h-96">
                  <div className="mb-4">
                    <strong className="text-red-600">Error:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {error?.toString()}
                    </pre>
                  </div>
                  <div className="mb-4">
                    <strong className="text-red-600">Stack Trace:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {error?.stack}
                    </pre>
                  </div>
                  <div>
                    <strong className="text-red-600">Component Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {errorInfo?.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {/* Contact Support */}
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <a
                  href="mailto:support@colourmebrazil.com"
                  className="text-blue-600 underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * HOC to wrap components with Error Boundary
 * Usage: export default withErrorBoundary(MyComponent);
 */
export const withErrorBoundary = (Component, fallback) => {
  return function WithErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};
