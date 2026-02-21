import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center space-y-5">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50 mx-auto">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                An unexpected error occurred. Our team has been notified. Please try refreshing the page.
              </p>
              {this.state.error?.message && (
                <p className="text-xs font-mono bg-gray-100 rounded p-2 text-red-700 text-left break-all">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.href = "/products";
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
