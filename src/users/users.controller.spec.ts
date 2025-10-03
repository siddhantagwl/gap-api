import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn().mockResolvedValue({
        _id: 'user123',
        name: 'John Doe',
        email: 'john@test.com',
        role: 'client',
      }),
      findById: jest.fn().mockResolvedValue({
        _id: 'user123',
        name: 'John Doe',
        email: 'john@test.com',
        role: 'client',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
