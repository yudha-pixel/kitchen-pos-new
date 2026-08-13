'use client';

import React from 'react';
import { OfflineErrorHandler, type OfflineErrorSuggestion } from '@/src/lib/offlineErrorHandler';

interface OfflineErrorProps {
  error: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const OfflineError: React.FC<OfflineErrorProps> = ({ 
  error, 
  onRetry,
  onDismiss,
  className = ''
}) => {
  const suggestions = OfflineErrorHandler.getErrorSuggestions(error);

  const handleAction = (action: () => void) => {
    action();
    onDismiss?.();
  };

  const getErrorIcon = () => {
    if (error && typeof error === 'object' && 'name' in error) {
      switch (error.name) {
        case 'NetworkError':
          return '📡';
        case 'ApiError':
          return '⚠️';
        case 'OfflineOperationError':
          return '📴';
        case 'DataValidationError':
          return '🔍';
        default:
          return '❌';
      }
    }
    return '❌';
  };

  const getSeverityColor = () => {
    if (error && typeof error === 'object' && 'name' in error) {
      switch (error.name) {
        case 'NetworkError':
          return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        case 'OfflineOperationError':
          return 'bg-blue-50 border-blue-200 text-blue-800';
        case 'DataValidationError':
          return 'bg-orange-50 border-orange-200 text-orange-800';
        default:
          return 'bg-red-50 border-red-200 text-red-800';
      }
    }
    return 'bg-red-50 border-red-200 text-red-800';
  };

  return (
    <div className={`${getSeverityColor()} border rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{getErrorIcon()}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{suggestions.title}</h3>
          <p className="text-sm opacity-90 mb-4">{suggestions.message}</p>
          
          <div className="flex flex-wrap gap-2">
            {suggestions.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action.action)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  action.primary
                    ? 'bg-white/80 hover:bg-white text-current'
                    : 'bg-white/50 hover:bg-white/70 text-current'
                }`}
              >
                {action.label}
              </button>
            ))}
            
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-md text-sm font-medium bg-white/50 hover:bg-white/70 text-current transition-colors"
              >
                Retry
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 rounded-md text-sm font-medium bg-white/50 hover:bg-white/70 text-current transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/30 rounded-md transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Compact version for inline error display
interface CompactOfflineErrorProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export const CompactOfflineError: React.FC<CompactOfflineErrorProps> = ({ 
  error, 
  onRetry,
  className = ''
}) => {
  const message = OfflineErrorHandler.getUserMessage(error);

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-3 ${className}`}>
      <span className="text-red-500">⚠️</span>
      <p className="text-sm text-red-700 flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

// Toast version for temporary error notifications
interface ToastOfflineErrorProps {
  error: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export const ToastOfflineError: React.FC<ToastOfflineErrorProps> = ({ 
  error, 
  onRetry,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 5000
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, autoDismissDelay, onDismiss]);

  if (!isVisible) return null;

  const message = OfflineErrorHandler.getUserMessage(error);

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md animate-slide-up">
      <span className="text-xl">⚠️</span>
      <p className="text-sm flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-sm font-medium transition-colors"
        >
          Retry
        </button>
      )}
      <button
        onClick={() => {
          setIsVisible(false);
          onDismiss?.();
        }}
        className="p-1 hover:bg-white/20 rounded-md transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default OfflineError;