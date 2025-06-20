import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("Reservation API")
    .setDescription("API for Reservation")
    .setVersion("1.0")
    .addTag("Reservation")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);

  const port = configService.get<number>("PORT") || 3004;

  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
