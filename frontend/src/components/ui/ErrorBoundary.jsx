import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 my-6 text-center shadow-2xl max-w-xl mx-auto space-y-4 text-slate-200">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl w-fit mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Something went wrong rendering this component</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
