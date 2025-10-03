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

    async assign(requestId: string, userId: string): Promise<ServiceRequest> {
        // Check if the user exists and is a service provider
        const user = await this.usersService.findById(userId);

        // make sure not a client and only service providers can be assigned to requests
        if (user.role !== 'service_provider') {
            throw new ForbiddenException('Only service providers can be assigned to requests');
        }

        // Find the request and update it
        const request = await this.serviceRequestModel.findByIdAndUpdate(
            requestId,
            { assignedTo: userId },
            { new: true }, // This will returns the updated document
        );

        if (!request) {
            throw new NotFoundException('Service request not found');
        }

        return request;
    }

}