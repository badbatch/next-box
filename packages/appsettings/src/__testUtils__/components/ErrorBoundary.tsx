import { Component, type ReactNode } from 'react';

export type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | undefined;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public override state: ErrorBoundaryState = { error: undefined };

  public override render(): ReactNode {
    if (this.state.error) {
      return <div>{this.state.error.message}</div>;
    }

    return this.props.children;
  }
}
