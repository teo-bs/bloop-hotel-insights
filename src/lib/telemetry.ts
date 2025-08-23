import { featureFlags } from './featureFlags';

export type TelemetryEvent = 
  | 'integrations.view'
  | 'integrations.template_download'
  | 'integrations.upload_start'
  | 'integrations.upload_complete'
  | 'integrations.upload_fail'
  | 'integrations.row_error'
  | 'integrations.disconnect'
  | 'integrations.manage_open'
  | 'dashboard.widget_view'
  | 'dashboard.filter_change'
  | 'reviews.view'
  | 'reviews.filter'
  | 'reviews.export';

export interface TelemetryData {
  event: TelemetryEvent;
  properties?: Record<string, any>;
  timestamp?: string;
  user_id?: string;
  session_id?: string;
}

class TelemetryService {
  private sessionId: string;
  private userId?: string;
  private eventQueue: TelemetryData[] = [];
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = featureFlags.analytics.telemetryEnabled;
    
    // Flush events periodically
    if (this.isEnabled) {
      setInterval(() => this.flush(), 30000); // Every 30 seconds
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(event: TelemetryEvent, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const telemetryData: TelemetryData = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      timestamp: new Date().toISOString(),
      user_id: this.userId,
      session_id: this.sessionId,
    };

    this.eventQueue.push(telemetryData);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Telemetry:', telemetryData);
    }

    // Flush immediately for critical events
    const criticalEvents: TelemetryEvent[] = [
      'integrations.upload_fail',
      'integrations.row_error'
    ];
    
    if (criticalEvents.includes(event)) {
      this.flush();
    }
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.track('integrations.upload_fail', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  trackPerformance(metric: string, duration: number, properties?: Record<string, any>) {
    if (!featureFlags.analytics.performanceMonitoringEnabled) return;

    this.track('dashboard.widget_view', {
      metric,
      duration_ms: duration,
      ...properties,
    });
  }

  private async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real implementation, you would send to your analytics service
      // For now, we'll just log batch size
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Flushing ${events.length} telemetry events`);
      }

      // TODO: Send to analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events })
      // });

    } catch (error) {
      console.error('Failed to flush telemetry events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  // Alert on repeated failures
  trackRepeatedFailure(event: TelemetryEvent, threshold: number = 3) {
    const recentEvents = this.eventQueue
      .filter(e => e.event === event)
      .filter(e => {
        const eventTime = new Date(e.timestamp!).getTime();
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        return eventTime > oneHourAgo;
      });

    if (recentEvents.length >= threshold) {
      console.warn(`🚨 Alert: ${event} occurred ${recentEvents.length} times in the last hour`);
      
      // In a real implementation, you would send an alert
      // this.sendAlert(`Repeated failure: ${event}`, recentEvents);
    }
  }
}

export const telemetry = new TelemetryService();

// React hook for telemetry
import { useEffect } from 'react';

export function useTelemetry(event: TelemetryEvent, properties?: Record<string, any>) {
  useEffect(() => {
    telemetry.track(event, properties);
  }, [event, JSON.stringify(properties)]);
}

export function usePerformanceTracking(metric: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      telemetry.trackPerformance(metric, duration);
    };
  }, [metric]);
}