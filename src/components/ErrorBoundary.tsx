import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // Surface to console + (optionally) any analytics later
    console.error("[ErrorBoundary] Caught render error:", error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
          <div className="max-w-md w-full text-center rounded-3xl border border-border/60 bg-card shadow-card p-8">
            <h1 className="font-display text-2xl mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">
              The page hit an unexpected error. Please try again.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { this.reset(); window.location.reload(); }}
                className="h-11 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium"
              >
                Reload
              </button>
              <button
                onClick={() => { this.reset(); window.location.href = "/"; }}
                className="h-11 px-5 rounded-full border border-border text-sm font-medium"
              >
                Go home
              </button>
            </div>
            {import.meta.env.DEV && (
              <pre className="mt-6 text-left text-[11px] text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
