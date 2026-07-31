import { ObjectId } from 'mongodb';

import { FailedEmail } from '@/domain/FailedEmail';
import { FailedEmailsRepository } from '@/repositories/persistence/FailedEmailsRepository';

describe('FailedEmailsRepository', () => {
  let repository: FailedEmailsRepository;
  let mockCollection: any;
  let mockDb: any;
  let mockClient: any;

  beforeEach(() => {
    mockCollection = {
      insertOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    mockClient = {
      db: jest.fn().mockReturnValue(mockDb),
    };

    repository = new FailedEmailsRepository({
      dbClient: mockClient,
      config: { collectionName: 'failed_emails' },
    });
  });

  it('persists the failed email together with its error message', async () => {
    const insertedId = new ObjectId('6a2a3169441e2b16bc9d1867');
    mockCollection.insertOne.mockResolvedValue({ insertedId });

    const result = await repository.create({
      to: 'user@example.com',
      subject: 'Tu cuenta fue aprobada',
      html: '<p>hola</p>',
      error: '{"message":"boom"}',
    });

    expect(mockDb.collection).toHaveBeenCalledWith('failed_emails');
    expect(mockCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        error: '{"message":"boom"}',
        createdAt: expect.any(Number),
      }),
    );
    expect(result).toBeInstanceOf(FailedEmail);
    expect(result.id).toBe(insertedId.toString());
  });
});
