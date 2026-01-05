import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * PWA Interceptor
 * 
 * Adds PWA-friendly HTTP headers to responses:
 * - Cache-Control headers for appropriate caching
 * - Prevents caching of sensitive/authenticated routes
 * - Adds CORS headers for PWA compatibility
 * - Sets proper content types
 */
@Injectable()
export class PWAInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Determine if this is a GET request that should be cached
    const isGetRequest = request.method === 'GET';
    const isPublicRoute = this.isPublicRoute(request.path);
    const isStaticAsset = this.isStaticAsset(request.path);

    return next.handle().pipe(
      tap(() => {
        // Set CORS headers for PWA
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        );
        response.setHeader(
          'Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        );
        response.setHeader('Access-Control-Allow-Credentials', 'true');

        // Set cache headers based on route type
        if (isGetRequest && isPublicRoute && !isStaticAsset) {
          // Cache public GET requests for 1 hour, allow stale-while-revalidate
          response.setHeader(
            'Cache-Control',
            'public, max-age=3600, stale-while-revalidate=86400',
          );
        } else if (isGetRequest && isStaticAsset) {
          // Cache static assets for 1 year (immutable)
          response.setHeader(
            'Cache-Control',
            'public, max-age=31536000, immutable',
          );
        } else if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE' || request.method === 'PATCH') {
          // Never cache mutations
          response.setHeader(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, private',
          );
          response.setHeader('Pragma', 'no-cache');
          response.setHeader('Expires', '0');
        } else if (this.isAuthenticatedRoute(request.path)) {
          // Don't cache authenticated routes aggressively
          response.setHeader(
            'Cache-Control',
            'private, no-cache, no-store, must-revalidate',
          );
        } else {
          // Default: no cache
          response.setHeader(
            'Cache-Control',
            'no-cache, no-store, must-revalidate',
          );
        }

        // Add PWA-specific headers
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('X-Frame-Options', 'DENY');
        response.setHeader('X-XSS-Protection', '1; mode=block');

        // Set proper content type for JSON responses
        if (
          !response.getHeader('Content-Type') &&
          typeof response.locals.body === 'object'
        ) {
          response.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
      }),
    );
  }

  /**
   * Check if route is public (can be cached)
   */
  private isPublicRoute(path: string): boolean {
    // Add routes that should be cached
    const publicRoutes = [
      '/service',
      '/schedule',
      '/time-slot',
    ];

    // Exclude auth routes
    if (path.startsWith('/auth') || path.startsWith('/user')) {
      return false;
    }

    return publicRoutes.some((route) => path.startsWith(route));
  }

  /**
   * Check if route is authenticated (should not be cached)
   */
  private isAuthenticatedRoute(path: string): boolean {
    return (
      path.startsWith('/auth') ||
      path.startsWith('/user') ||
      path.startsWith('/appointment')
    );
  }

  /**
   * Check if request is for static asset
   */
  private isStaticAsset(path: string): boolean {
    return /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(
      path,
    );
  }
}

