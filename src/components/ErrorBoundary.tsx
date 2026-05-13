import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ React Error Boundary caught an error:', error);
    console.error('❌ Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-lg">
            <h2 className="text-xl font-bold text-red-400 mb-2">⚠️ 渲染出错</h2>
            <p className="text-red-300 text-sm mb-4">{this.state.error?.message}</p>
            <p className="text-slate-400 text-xs">请打开浏览器控制台 (F12) 查看详细错误信息</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
