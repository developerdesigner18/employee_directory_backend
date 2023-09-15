/* eslint-disable prettier/prettier */
import {
  Controller,
  DefaultValuePipe,
  Get,
  Query,
  Post,
  Res,
  HttpCode,
  Body,
} from '@nestjs/common';
import { AppService } from './app.service';
import { EmployeeDto } from './app.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
@ApiTags('Employee')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get employees' }) // Add a summary for the operation
  // @ApiBody({ type: EmployeeDto }) // Define the request body schema
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: EmployeeDto,
    isArray: true,
  }) // Define the response schema
  getEmployee(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortField') sortField: string | null,
    @Query('sortOrder', new DefaultValuePipe('asc')) sortOrder: string | null,
    @Query('query') query: string | null,
    @Query('date') date: string | null,
  ): { items: EmployeeDto[]; totalLength: number } {
    const rangeData = this.appService.getDataWithinDateRange(date);

    const searchData = this.appService.getSearchData(rangeData, query);

    const sortData = this.appService.getSortData(
      searchData,
      sortField,
      sortOrder,
    );
    const { items, totalLength } = this.appService.fetchData(
      page,
      limit,
      sortData,
    );

    return { items, totalLength };
  }

  @Post('pdf')
  @HttpCode(200)
  async generatePdf(@Res() res: Response, @Body() data: any): Promise<void> {
    if (!data) {
      res.status(400).send('Data is required.');
      return;
    }
    const filePath = this.appService.generatePdf(data);

    res.send({ link: filePath });
  }

  @Post('csv')
  @HttpCode(200)
  async generateCsv(@Res() res: Response, @Body() data: any): Promise<void> {
    if (!data) {
      res.status(400).send('Data is required.');
      return;
    }
    const filePath = await this.appService.generateCsv(data);

    res.send({ link: filePath });
  }
}
