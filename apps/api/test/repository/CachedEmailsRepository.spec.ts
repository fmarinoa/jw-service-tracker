import { ObjectId } from 'mongodb';

import { EmailMessage } from '@/domain/EmailMessage';
import { CachedEmailsRepository } from '@/repositories/persistence/CachedEmailsRepository';

describe('CachedEmailsRepository', () => {
  let repository: CachedEmailsRepository;
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

    repository = new CachedEmailsRepository({
      dbClient: mockClient,
      config: { collectionName: 'cached_emails' },
    });
  });

  it('inserts the email into the cached_emails collection and returns no error', async () => {
    const insertedId = new ObjectId('6a2a3169441e2b16bc9d1867');
    mockCollection.insertOne.mockResolvedValue({ insertedId });

    const message = new EmailMessage({
      to: 'user@example.com',
      subject: 'Tu cuenta fue aprobada',
      html: '<p>hola</p>',
    });

    const result = await repository.sendEmail(message);

    expect(mockDb.collection).toHaveBeenCalledWith('cached_emails');
    expect(mockCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Tu cuenta fue aprobada',
        html: '<p>hola</p>',
        createdAt: expect.any(Number),
      }),
    );
    expect(result).toEqual({ data: { id: insertedId.toString() } });
  });
});
