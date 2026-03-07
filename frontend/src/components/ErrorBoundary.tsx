import { Component,ErrorInfo,type ReactNode } from "react";

interface Props{
    children:ReactNode
    fallback?:ReactNode
}

interface State{
    hasError:boolean;
    error:Error|null
}

class ErrorBoundary extends Component<Props,State>{
    
    constructor(props:Props){
        super(props)
        this.state={hasError:false,error:null}
    }

    static getDerivedStateFromError(error:Error):State{
        return {hasError:true,error}
    }
    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error("Errorboundary caught",error,info)
    }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
 render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-white font-bold text-xl mb-2">Something went wrong</h2>
            <p className="text-gray-400 text-sm mb-2">An unexpected error occurred.</p>
            {this.state.error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-6 font-mono">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;