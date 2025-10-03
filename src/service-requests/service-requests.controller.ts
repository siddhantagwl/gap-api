import { Controller, Post, Body } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';

@Controller('service-requests') // listen to /service-requests route
export class ServiceRequestsController {
  constructor(private readonly service: ServiceRequestsService) {}

  @Post()
  create(@Body() dto: CreateServiceRequestDto) {
    // grabs the JSON data from the request body
    // and passes it to the service layer to handle the business logic
    return this.service.create(dto);
  }
}