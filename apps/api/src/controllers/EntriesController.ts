import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BaseController } from './BaseController';
import { EntriesService } from '../services/EntriesService';
import { Entry } from '../domain/Entry';
import { PreachingEntry } from '@jw-tracker/shared';
import { z } from 'zod';
import { FilterEntry } from '../domain/FilterEntry';

export interface EntriesControllerProps {
  service: EntriesService;
}

export class EntriesController extends BaseController {
  private service: EntriesService;



  constructor(props: EntriesControllerProps) {
    super();
    this.service = props.service;
  }

  async getEntries(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const userId = this.getUserId(event);

      const filters = FilterEntry.validateFilter(event.queryStringParameters ?? {});

      const response = await this.service.getEntries(userId, filters);

      return this.buildResponse(200, response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  async createEntry(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const userId = this.getUserId(event);

      if (!event.body) {
        return this.buildResponse(400, {
          error: 'VALIDATION_ERROR',
          message: 'The request body cannot be empty.',
        });
      }

      let parsedJson: any;
      try {
        parsedJson = JSON.parse(event.body);
      } catch (err) {
        return this.buildResponse(400, {
          error: 'VALIDATION_ERROR',
          message: 'The request body must be a valid JSON.',
        });
      }

      const domainEntry = Entry.validateForCreate({
        ...parsedJson,
        userId,
      });

      const response = await this.service.createEntry(userId, domainEntry);

      return this.buildResponse(201, response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  async updateEntry(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const userId = this.getUserId(event);
      const id = event.pathParameters?.id;

      if (!id) {
        return this.buildResponse(400, {
          error: 'VALIDATION_ERROR',
          message: 'The id parameter is required in the path.',
        });
      }

      if (!event.body) {
        return this.buildResponse(400, {
          error: 'VALIDATION_ERROR',
          message: 'The request body cannot be empty.',
        });
      }

      let parsedJson: any;
      try {
        parsedJson = JSON.parse(event.body);
      } catch (err) {
        return this.buildResponse(400, {
          error: 'VALIDATION_ERROR',
          message: 'The request body must be a valid JSON.',
        });
      }

      const domainEntry = Entry.validateForUpdate({
        ...parsedJson,
        id,
        userId,
      });

      const response = await this.service.updateEntry(userId, domainEntry);

      return this.buildResponse(200, response);
    } catch (err) {
      return this.handleError(err);
    }
  }

  async deleteEntry(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const userId = this.getUserId(event);
      const id = event.pathParameters?.id;

      if (!id) {
        return this.buildResponse(400, {
          error: 'VALIDATION_ERROR',
          message: 'The id parameter is required in the path.',
        });
      }

      await this.service.deleteEntry(userId, id);

      return this.buildResponse(200, {
        success: true,
        message: 'Entry successfully deleted',
      });
    } catch (err) {
      return this.handleError(err);
    }
  }
}
