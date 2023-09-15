/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class EmployeeDto {
  @ApiProperty()
  public id: number;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public email: string;

  @ApiProperty()
  public job_title: string;

  @ApiProperty()
  public department: string;

  @ApiProperty()
  public start_date: string;

  @ApiProperty()
  public end_date: string;
}
