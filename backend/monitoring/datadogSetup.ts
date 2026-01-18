/**
 * DataDog APM Setup
 * Application Performance Monitoring and Distributed Tracing
 */

import { Express, Request, Response, NextFunction } from 'express';

/**
 * Initialize DataDog Tracer
 * Must be called before importing other modules
 */
export function initializeDatadog() {
  // This should be called VERY EARLY in the application
  const tracer = require('dd-trace').init({
    hostname: process.env.DATADOG_AGENT_HOST || 'localhost',
    port: parseInt(process.env.DATADOG_AGENT_PORT || '8126'),
    env: process.env.NODE_ENV || 'development',
    service: 'fairtradeworker-backend',
    version: process.env.APP_VERSION || '1.0.0',
    logInjection: true,
    profiling: {
      enabled: process.env.DATADOG_PROFILING_ENABLED === 'true',
      sampleRate: 0.1,
    },
    samplingRules: [
      {
        service: 'fairtradeworker-backend',
        sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
      },
    ],
    analytics: {
      enabled: true,
    },
  });

  console.log('✅ DataDog APM initialized');
  return tracer;
}

/**
 * Performance monitoring middleware
 */
export function datadogMetricsMiddleware(tracer: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const route = req.route?.path || req.path;

    // Set span tags
    const span = tracer.scope().active();
    if (span) {
      span.setTag('http.method', req.method);
      span.setTag('http.url', req.path);
      span.setTag('http.route', route);
      span.setTag('http.client_ip', req.ip);
    }

    // Track response
    res.on('finish', () => {
      const duration = Date.now() - start;

      if (span) {
        span.setTag('http.status_code', res.statusCode);
        span.setTag('http.duration_ms', duration);
      }

      // Log slow requests
      if (duration > 1000) {
        console.warn(`⚠️  Slow request: ${req.method} ${req.path} took ${duration}ms`);
      }
    });

    next();
  };
}

/**
 * Database query monitoring
 */
export function monitorDatabaseQueries(tracer: any) {
  return {
    /**
     * Wrap Prisma query for tracing
     */
    async executeQuery(operation: string, query: () => Promise<any>) {
      const span = tracer.startSpan(`prisma.${operation}`, {
        resource: operation,
        type: 'db',
        tags: {
          'db.type': 'postgresql',
          'service.name': 'postgres',
        },
      });

      try {
        const result = await query();
        span.setTag('db.status', 'success');
        return result;
      } catch (error: any) {
        span.setTag('db.status', 'error');
        span.setTag('db.error', error.message);
        throw error;
      } finally {
        span.finish();
      }
    },
  };
}

/**
 * External API call monitoring
 */
export function monitorExternalAPI(tracer: any, serviceName: string) {
  return {
    /**
     * Wrap external API call
     */
    async call(method: string, url: string, fn: () => Promise<any>) {
      const span = tracer.startSpan(`${serviceName}.${method}`, {
        resource: `${serviceName} ${method}`,
        type: 'http',
        tags: {
          'http.method': method,
          'http.url': url,
          'service.name': serviceName,
        },
      });

      try {
        const result = await fn();
        span.setTag('http.status', 'success');
        return result;
      } catch (error: any) {
        span.setTag('http.status', 'error');
        span.setTag('http.error_message', error.message);
        console.error(`❌ ${serviceName} API error:`, error);
        throw error;
      } finally {
        span.finish();
      }
    },
  };
}

/**
 * Custom metrics
 */
export class DatadogMetrics {
  private static metrics: Map<string, number> = new Map();

  static increment(metric: string, tags?: Record<string, string>) {
    const value = (this.metrics.get(metric) || 0) + 1;
    this.metrics.set(metric, value);
    console.log(`📊 Metric ${metric}: ${value}`);
  }

  static gauge(metric: string, value: number, tags?: Record<string, string>) {
    this.metrics.set(metric, value);
    console.log(`📊 Gauge ${metric}: ${value}`);
  }

  static histogram(metric: string, value: number, tags?: Record<string, string>) {
    console.log(`📊 Histogram ${metric}: ${value}`);
  }

  static timing(metric: string, duration: number, tags?: Record<string, string>) {
    console.log(`⏱️  Timing ${metric}: ${duration}ms`);
  }

  static getAll() {
    return Object.fromEntries(this.metrics);
  }

  static reset() {
    this.metrics.clear();
  }
}

/**
 * Business event tracking
 */
export const BusinessEvents = {
  JOB_CREATED: 'job.created',
  JOB_COMPLETED: 'job.completed',
  BID_SUBMITTED: 'bid.submitted',
  BID_ACCEPTED: 'bid.accepted',
  BID_REJECTED: 'bid.rejected',
  CONTRACT_CREATED: 'contract.created',
  CONTRACT_COMPLETED: 'contract.completed',
  PAYMENT_HELD: 'payment.held',
  PAYMENT_RELEASED: 'payment.released',
  PAYMENT_FAILED: 'payment.failed',
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_FAILED: 'notification.failed',
  USER_REGISTERED: 'user.registered',
  USER_VERIFIED: 'user.verified',
};

/**
 * Track business event
 */
export function trackBusinessEvent(event: string, userId: string, metadata?: Record<string, any>) {
  DatadogMetrics.increment(`event.${event}`, { userId });
  console.log(`📊 Event: ${event}`, metadata);
}

/**
 * Error monitoring configuration
 */
export const ErrorMonitoring = {
  STRIPE_ERROR: 'stripe.error',
  TWILIO_ERROR: 'twilio.error',
  SENDGRID_ERROR: 'sendgrid.error',
  DATABASE_ERROR: 'database.error',
  VALIDATION_ERROR: 'validation.error',
  AUTHENTICATION_ERROR: 'auth.error',
  AUTHORIZATION_ERROR: 'authz.error',
};

/**
 * Track error event
 */
export function trackError(errorType: string, error: Error, context?: Record<string, any>) {
  DatadogMetrics.increment(`error.${errorType}`);
  console.error(`❌ ${errorType}:`, error.message, context);
}

export default {
  initializeDatadog,
  datadogMetricsMiddleware,
  monitorDatabaseQueries,
  monitorExternalAPI,
  DatadogMetrics,
  trackBusinessEvent,
  trackError,
  BusinessEvents,
  ErrorMonitoring,
};
