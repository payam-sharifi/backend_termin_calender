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
  const app = await NestFactory.create(AppModule,{ cors: true });
  app.useGlobalFilters(new AllExceptionsFilter());
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  
  // PWA-friendly CORS configuration for production
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS');
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  
  // Default production origins (for PWA support)
  const defaultOrigins = [
    'https://termin.hengameh-luxe-beauty.de',
    'https://www.termin.hengameh-luxe-beauty.de',
    'https://www.termin.appventuregmbh.com',
    'https://termin.appventuregmbh.com',
  ];
  
  // Parse allowed origins from environment variable (comma-separated)
  // Example: ALLOWED_ORIGINS=http://localhost:4500,http://172.20.10.4:4500,https://yourdomain.com
  const envOrigins = allowedOrigins 
    ? allowedOrigins.split('https://termin.appventuregmbh.com,https://www.termin.appventuregmbh.com,https://termin.hengameh-luxe-beauty.de,https://www.termin.hengameh-luxe-beauty.de').map(origin => origin.trim()).filter(origin => origin.length > 0)
    : [];
  
  // Combine default origins with environment origins (remove duplicates)
  const origins = [...new Set([...defaultOrigins, ...envOrigins])];
  
  // In development, allow all origins for easier testing
  // In production, only allow specified origins
  const corsOptions = {
    origin: nodeEnv === 'production' && origins.length > 0
      ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          // Allow requests with no origin (like mobile apps, curl requests, or PWA service workers)
          if (!origin) {
            return callback(null, true);
          }
          
          // Normalize origin (remove trailing slash)
          const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
          
          // Check if origin is in allowed list (with or without trailing slash)
          if (origins.includes(origin) || origins.includes(normalizedOrigin)) {
            return callback(null, true);
          }
          
          // Also allow same-origin requests (for API-to-API calls)
          if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
          }
          
          // Reject other origins
          callback(new Error('Not allowed by CORS'));
        }
      : true, // Allow all in development
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

  // Add PWA interceptor for cache headers
  app.useGlobalInterceptors(new PWAInterceptor());
  

  const config = new DocumentBuilder()
    .setTitle("Reservation API")
    .setDescription("API for Reservation")
    .setVersion("1.0")
    .addTag("Reservation")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);

  const port = configService.get<number>("PORT") || 4001;

  await app.listen(port, '0.0.0.0');


  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
