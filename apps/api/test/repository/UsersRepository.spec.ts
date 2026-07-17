import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

import { User } from '@/domain/User';
import { UsersRepository } from '@/repositories/UsersRepository';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let mockCollection: any;
  let mockDb: any;
  let mockClient: any;

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    mockClient = {
      db: jest.fn().mockReturnValue(mockDb),
    };

    repository = new UsersRepository({
      client: mockClient,
      config: { collectionName: 'users' },
    });

    jest.clearAllMocks();
  });

  describe('findByPhone', () => {
    it('should query collection and return User object if user exists', async () => {
      const mockDbUser = {
        _id: new ObjectId('6a2a3169441e2b16bc9d1867'),
        name: 'FRANCO MARIÑO',
        phone: '+51932337417',
      };

      mockCollection.findOne.mockResolvedValue(mockDbUser);

      const result = await repository.findByPhone('+51932337417');

      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        phone: '+51932337417',
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('6a2a3169441e2b16bc9d1867');
      expect(result?.name).toBe('FRANCO MARIÑO');
    });

    it('should return null if user does not exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await repository.findByPhone('+51932337417');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should query collection using ObjectId and return User if found', async () => {
      const mockId = '6a2a3169441e2b16bc9d1867';
      const mockDbUser = {
        _id: new ObjectId(mockId),
        name: 'FRANCO MARIÑO',
        phone: '+51932337417',
      };

      mockCollection.findOne.mockResolvedValue(mockDbUser);

      const result = await repository.findById(mockId);

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: new ObjectId(mockId),
      });
      expect(result?.id).toBe(mockId);
    });
  });

  describe('create', () => {
    it('should hash password, capitalize name, and insert user into collection', async () => {
      const inputUser = new User({
        name: 'franco mariño',
        phone: '+51932337417',
        password: 'plain-password',
      });

      const mockInsertedId = new ObjectId('6a2a3169441e2b16bc9d1867');
      mockCollection.insertOne.mockResolvedValue({
        insertedId: mockInsertedId,
      });
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashed-password'));

      const result = await repository.create(inputUser);

      expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'FRANCO MARIÑO',
          password: 'hashed-password',
          phone: '+51932337417',
          createdAt: expect.any(Number),
        }),
      );
      expect(result.id).toBe(mockInsertedId.toString());
      expect(result.name).toBe('FRANCO MARIÑO');
    });
  });

  describe('update', () => {
    it('should successfully update goal and preacherType for user', async () => {
      const mockId = '6a2a3169441e2b16bc9d1867';
      const userToUpdate = {
        id: mockId,
        monthlyGoal: 50,
        preacherType: 'regular_pioneer' as const,
      };

      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await repository.update(userToUpdate);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(mockId) },
        {
          $set: expect.objectContaining({
            monthlyGoal: 50,
            preacherType: 'regular_pioneer',
            updatedAt: expect.any(Number),
          }),
        },
      );
      expect(result.id).toBe(mockId);
      expect(result.monthlyGoal).toBe(50);
      expect(result.preacherType).toBe('regular_pioneer');
    });

    it('should throw error if user id is missing during update', async () => {
      const userWithoutId = {
        monthlyGoal: 50,
      };

      await expect(repository.update(userWithoutId)).rejects.toThrow(
        'User ID is required for update',
      );
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });
  });
});
