import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  // validates that the status is one of the three valid values.
  @IsIn(['open', 'in_progress', 'done'])
  status: string;
}
