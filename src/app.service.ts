/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { EmployeeDto } from './app.dto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createObjectCsvWriter } from 'csv-writer';

@Injectable()
export class AppService {
  private readonly data: any[];

  constructor() {
    this.data = JSON.parse(readFileSync('MOCK_DATA.json', 'utf-8'));
  }

  getHello(): string {
    return 'Hello World!';
  }

  getDataWithinDateRange(date): EmployeeDto[] {
    if (date == 'null') {
      return this.data;
    }

    const split = date.split(',');

    const start_date = +new Date(split[0]); // Replace with your desired start date
    const end_date = +new Date(split[1]);

    return this.data.filter((item) => {
      const itemStartDate = +new Date(item.start_date);
      const itemEndDate = +new Date(item.end_date);
      return itemStartDate >= start_date && itemEndDate <= end_date;
    });
  }

  getSearchData(data: EmployeeDto[], query): EmployeeDto[] {
    if (query == 'null') {
      return data;
    }

    const lowercaseQuery = query ? query.toLowerCase() : '';

    const filteredData = data.filter((item) => {
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          const value = item[key].toString().toLowerCase();
          if (value.includes(lowercaseQuery)) {
            return true;
          }
        }
      }
      return false;
    });

    return filteredData;
  }

  getSortData(data: EmployeeDto[], sortField, sortOrder): EmployeeDto[] {
    if (sortField == 'null') {
      return data;
    }

    const sortedUsers = data.sort((a, b) => {
      if (sortOrder === 'ascend') {
        return a[sortField].localeCompare(b[sortField]);
      } else if (sortOrder === 'descend') {
        return b[sortField].localeCompare(a[sortField]);
      } else {
        return 0;
      }
    });

    return sortedUsers;
  }

  fetchData(
    page,
    limit,
    data: EmployeeDto[],
  ): { items: EmployeeDto[]; totalLength: number } {
    // Calculate pagination offsets
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const items = data.slice(startIndex, endIndex);

    return { items, totalLength: this.data.length };
  }

  generatePdf(data: EmployeeDto[]): string {
    const filename = +new Date() + '.pdf';

    const doc = new jsPDF();
    doc.text('Table Data PDF', 10, 10);

    // Create an array of data to represent the table
    const tableData = data.map((item) => [
      item.name,
      item.email,
      item.job_title,
      item.department,
    ]);

    autoTable(doc, {
      head: [['Name', 'Email', 'Job Title', 'Department']],
      body: tableData,
      startY: 20,
    });

    doc.save(`public/${filename}`);

    return filename;
  }

  async generateCsv(data: EmployeeDto[]): Promise<string> {
    const filename = +new Date() + '.csv';

    const csvWriter = createObjectCsvWriter({
      path: `public/${filename}`,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'job_title', title: 'Job Title' },
        { id: 'department', title: 'Department' },
      ],
    });

    await csvWriter.writeRecords(data);

    return filename;
  }
}
