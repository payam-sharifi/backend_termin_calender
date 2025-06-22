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
async function bootstrap() {
  const app = await NestFactory.create(AppModule,{ cors: true });
  app.useGlobalFilters(new AllExceptionsFilter());
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  
  app.enableCors({
    origin: ['https://appventuregmbh.com', 'https://www.appventuregmbh.com','https://termin.appventuregmbh.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Authorization'] 
  });
  

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
