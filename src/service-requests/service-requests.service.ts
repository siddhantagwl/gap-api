import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceRequest } from './schemas/service-request.schema';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ServiceRequestsService {
  constructor(
    @InjectModel(ServiceRequest.name)
    private serviceRequestModel: Model<ServiceRequest>,
    private usersService: UsersService,
  ) {}

  // Define the valid status transitions
  private statusFlow = {
    open: 'in_progress',
    in_progress: 'done', // final is done , no further transitions
  };

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
      throw new ForbiddenException(
        'Only service providers can be assigned to requests',
      );
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

  async updateStatus(
    requestId: string,
    newStatus: string,
  ): Promise<ServiceRequest> {
    /*
            open → in_progress - allowed
            in_progress → done - allowed

            open → done  (can't skip)
            done → open  (can't go back)
            done → in_progress (can't go back)
        */

    // Find the request
    const request = await this.serviceRequestModel.findById(requestId);

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    const currentStatus = request.status;

    // Check if the transition is valid
    // Allow staying in the same status OR moving to the next valid status
    if (
      this.statusFlow[currentStatus] !== newStatus &&
      newStatus !== currentStatus
    ) {
      throw new ForbiddenException(
        `Cannot transition from ${currentStatus} to ${newStatus}. Valid next status: ${this.statusFlow[currentStatus] || 'none (already at final status)'}`,
      );
    }

    // Update the status
    request.status = newStatus;
    return request.save();
  }

  async findAll(status?: string): Promise<ServiceRequest[]> {
    // If status is provided, filter by it. Otherwise, get all.
    const filter = status ? { status } : {};

    // query the database
    return this.serviceRequestModel
      .find(filter)
      .populate('createdBy', 'name email role') // Include user details so using populate method
      .populate('assignedTo', 'name email role')
      .exec();
  }
}
