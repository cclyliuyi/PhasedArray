import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';
import App from './App.tsx';

// 全局错误捕获
window.addEventListener('error', (event) => {
  console.error('💥 全局 JavaScript 错误:', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 未处理的 Promise 拒绝:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
