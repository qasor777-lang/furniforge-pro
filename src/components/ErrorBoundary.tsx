"use client";
import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center gap-3 p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <h3 className="text-lg font-semibold">Xatolik yuz berdi</h3>
          <p className="text-sm text-muted max-w-md">
            {this.state.error?.message || "Noma'lum xatolik. Sahifani yangilab ko'ring."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/30 text-sm hover:bg-accent/20"
          >
            Qayta urinish
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
