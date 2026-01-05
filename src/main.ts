import { webcrypto as crypto } from 'crypto';

Object.defineProperty(globalThis, 'crypto', {
  value: crypto,
});

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";
import { PWAInterceptor } from "./common/pwa.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Global interceptor for PWA caching
  app.useGlobalInterceptors(new PWAInterceptor());

  const configService = app.get(ConfigService);

  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // Default production origins
  const defaultOrigins = [
    'https://termin.hengameh-luxe-beauty.de',
    'https://www.termin.hengameh-luxe-beauty.de',
    'https://www.termin.appventuregmbh.com',
    'https://termin.appventuregmbh.com',
  ];

  // Parse ALLOWED_ORIGINS from env variable (comma-separated)
  const allowedOriginsEnv = configService.get<string>('ALLOWED_ORIGINS') || '';
  const envOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map(o => o.trim()).filter(o => o.length > 0)
    : [];

  // Combine default and environment origins, remove duplicates
  const origins = [...new Set([...defaultOrigins, ...envOrigins])];

  // CORS configuration
  const corsOptions = {
    origin: nodeEnv === 'production'
      ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          // Allow requests with no origin (e.g., mobile apps, curl, service workers)
          if (!origin) return callback(null, true);

          // Normalize origin (remove trailing slash)
          const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
          const allowed = origins.map(o => o.endsWith('/') ? o.slice(0, -1) : o);

          // Allow if origin is in allowed list
          if (allowed.includes(normalizedOrigin)) return callback(null, true);

          // Allow localhost / 127.0.0.1 for testing
          if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);

          // Reject all other origins
          callback(new Error('Not allowed by CORS'));
        }
      : true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
    ],
    exposedHeaders: [
      'Content-Length',
      'Content-Type',
      'Cache-Control',
      'ETag',
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  // Log CORS configuration
  if (nodeEnv === 'production') {
    console.log('🔒 CORS configured for production');
    console.log('✅ Allowed origins:', origins.length > 0 ? origins.join(', ') : 'All (development mode)');
    console.log('📱 PWA support: Enabled (service workers and manifest.json allowed)');
  } else {
    console.log('🔓 CORS configured for development (all origins allowed)');
  }

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Reservation API")
    .setDescription("API for Reservation")
    .setVersion("1.0")
    .addTag("Reservation")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("swagger", app, document);

  const port = configService.get<number>("PORT") || 4002;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
