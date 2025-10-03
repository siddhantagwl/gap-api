import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceRequest } from './schemas/service-request.schema';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ServiceRequestsService {
  constructor(
    @InjectModel(ServiceRequest.name) private serviceRequestModel: Model<ServiceRequest>,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    // Check if the user exists and is a client sine only clients can create service requests
    const user = await this.usersService.findById(dto.createdBy);

    if (user.role !== 'client') {
      throw new ForbiddenException('Only clients can create service requests');
    }

    // save the service request to db
    const request = new this.serviceRequestModel(dto);
    return request.save();
  }
}