import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EntriesController } from '../src/controllers/EntriesController';
import { EntriesService } from '../src/services/EntriesService';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Entry } from '../src/domain/Entry';
import { User } from '../src/domain/User';

describe('EntriesController Unit Tests', () => {
  let serviceMock: EntriesService;
  let controller: EntriesController;

  beforeEach(() => {
    serviceMock = {
      getEntries: vi.fn(),
      createEntry: vi.fn(),
      updateEntry: vi.fn(),
      deleteEntry: vi.fn(),
    } as any;
    controller = new EntriesController({ service: serviceMock });
  });

  const createMockEvent = (
    method: string,
    sub: string | null,
    queryParams: any = null,
    body: string | null = null,
    pathParams: any = null
  ): APIGatewayProxyEvent => {
    return {
      httpMethod: method,
      path: '/entries',
      queryStringParameters: queryParams,
      pathParameters: pathParams,
      body,
      headers: {},
      multiValueHeaders: {},
      isBase64Encoded: false,
      stageVariables: {},
      requestContext: {
        authorizer: sub
          ? {
            claims: { sub },
          }
          : null,
        accountId: '',
        apiId: '',
        protocol: '',
        httpMethod: method,
        identity: {} as any,
        path: '/entries',
        stage: 'dev',
        requestId: '',
        requestTimeEpoch: 0,
        resourceId: '',
        resourcePath: '',
      },
      resource: '',
    } as any;
  };

  describe('getUserId', () => {
    it('should throw UNAUTHORIZED if sub is missing in claims', async () => {
      const event = createMockEvent('GET', null);
      const result = await controller.getEntries(event);

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toEqual({
        error: 'UNAUTHORIZED',
        message: 'Unauthorized: Missing user identification.',
      });
    });
  });

  describe('getEntries', () => {
    it('should return 200 and decode/encode cursors correctly', async () => {
      const mockEntries = [
        new Entry({
          id: '1',
          user: new User({ id: 'user-1' }),
          preachingDate: 1770000000000,
          hours: 1,
          minutes: 0,
          type: 'house_to_house',
          createdAt: 1000,
          updatedAt: 1000,
        }),
      ];
      const mockLastEvaluatedKey = { userId: 'user-1', preachingDate: 1770000000000, id: '1' };
      vi.mocked(serviceMock.getEntries).mockResolvedValue({
        entries: mockEntries,
        lastEvaluatedKey: mockLastEvaluatedKey,
      });

      const nextCursorParam = Buffer.from(JSON.stringify({ userId: 'user-1', preachingDate: 1770000000000, id: '0' })).toString('base64');
      const event = createMockEvent('GET', 'user-1', { limit: '10', nextCursor: nextCursorParam });

      const result = await controller.getEntries(event);

      expect(serviceMock.getEntries).toHaveBeenCalledWith(
        'user-1',
        10,
        {
          userId: 'user-1',
          preachingDate: 1770000000000,
          id: '0',
        },
        undefined,
        undefined
      );

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.entries).toEqual([
        {
          id: '1',
          userId: 'user-1',
          preachingDate: 1770000000000,
          hours: 1,
          minutes: 0,
          type: 'house_to_house',
          createdAt: 1000,
          updatedAt: 1000,
        }
      ]);
      const expectedCursor = Buffer.from(JSON.stringify(mockLastEvaluatedKey)).toString('base64');
      expect(body.nextCursor).toBe(expectedCursor);
    });

    it('should return 400 if nextCursor is invalid base64/JSON', async () => {
      const event = createMockEvent('GET', 'user-1', { limit: '10', nextCursor: 'not-base-64-!!' });
      const result = await controller.getEntries(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toBe('VALIDATION_ERROR');
    });
  });

  describe('createEntry', () => {
    it('should return 201 and created entry on successful creation', async () => {
      const mockCreated = new Entry({
        id: 'id-1',
        user: new User({ id: 'user-1' }),
        preachingDate: 1770000000000,
        hours: 1,
        minutes: 0,
        type: 'house_to_house',
        createdAt: 1000,
      });

      vi.mocked(serviceMock.createEntry).mockResolvedValue(mockCreated);

      const mockBody = JSON.stringify({
        preachingDate: 1770000000000,
        hours: 1,
        minutes: 0,
        type: 'house_to_house',
      });
      const event = createMockEvent('POST', 'user-1', null, mockBody);

      const result = await controller.createEntry(event);

      expect(serviceMock.createEntry).toHaveBeenCalled();
      expect(result.statusCode).toBe(201);
      expect(JSON.parse(result.body)).toEqual({
        id: 'id-1',
        userId: 'user-1',
        preachingDate: 1770000000000,
        hours: 1,
        minutes: 0,
        type: 'house_to_house',
        createdAt: 1000,
      });
    });

    it('should return 400 if body is invalid JSON', async () => {
      const event = createMockEvent('POST', 'user-1', null, '{ invalid json }');
      const result = await controller.createEntry(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if body fails Zod validation schema (e.g. invalid date)', async () => {
      const mockBody = JSON.stringify({
        preachingDate: -100,
        hours: 1,
        minutes: 0,
        type: 'house_to_house',
      });
      const event = createMockEvent('POST', 'user-1', null, mockBody);
      const result = await controller.createEntry(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toBe('VALIDATION_ERROR');
    });
  });

  describe('updateEntry', () => {
    it('should return 200 and updated entry on successful update', async () => {
      const mockUpdated = new Entry({
        id: 'id-1',
        user: new User({ id: 'user-1' }),
        preachingDate: 1770000000000,
        hours: 2,
        minutes: 15,
        type: 'revisits',
        createdAt: 1000,
        updatedAt: 2000,
      });

      vi.mocked(serviceMock.updateEntry).mockResolvedValue(mockUpdated);

      const mockBody = JSON.stringify({
        preachingDate: 1770000000000,
        hours: 2,
        minutes: 15,
        type: 'revisits',
      });
      const event = createMockEvent('PUT', 'user-1', null, mockBody, { id: 'id-1' });

      const result = await controller.updateEntry(event);

      expect(serviceMock.updateEntry).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({
        id: 'id-1',
        userId: 'user-1',
        preachingDate: 1770000000000,
        hours: 2,
        minutes: 15,
        type: 'revisits',
        createdAt: 1000,
        updatedAt: 2000,
      });
    });

    it('should return 400 if id is missing in PUT path', async () => {
      const event = createMockEvent('PUT', 'user-1', null, '{}');
      const result = await controller.updateEntry(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toBe('VALIDATION_ERROR');
    });
  });

  describe('deleteEntry', () => {
    it('should call service deleteEntry and return 200', async () => {
      const event = createMockEvent('DELETE', 'user-1', null, null, { id: 'entry-id' });

      const result = await controller.deleteEntry(event);

      expect(serviceMock.deleteEntry).toHaveBeenCalledWith('user-1', 'entry-id');
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).success).toBe(true);
    });

    it('should handle service not found error and return 404', async () => {
      const notFoundError = new Error('The preaching entry does not exist.');
      (notFoundError as any).code = 'NOT_FOUND';
      vi.mocked(serviceMock.deleteEntry).mockRejectedValue(notFoundError);

      const event = createMockEvent('DELETE', 'user-1', null, null, { id: 'entry-id' });
      const result = await controller.deleteEntry(event);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({
        error: 'NOT_FOUND',
        message: 'The preaching entry does not exist.',
      });
    });
  });
});
