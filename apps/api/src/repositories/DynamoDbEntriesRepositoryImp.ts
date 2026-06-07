import { DynamoDBDocumentClient, QueryCommand, PutCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { PreachingEntry } from '@jw-tracker/shared';
import { EntriesRepository } from './EntriesRepository';
import { Entry } from '../domain/Entry';
import { User } from '../domain/User';
import { BaseRepository } from './BaseRepository';
import { FilterEntry } from '../domain/FilterEntry';

export interface DynamoDbEntriesRepositoryProps {
  dbClient: DynamoDBDocumentClient;
  config: {
    entriesTable: string;
  }
}

export class DynamoDbEntriesRepositoryImp extends BaseRepository implements EntriesRepository {
  private dbClient: DynamoDBDocumentClient;
  private entriestableName: string;

  constructor(props: DynamoDbEntriesRepositoryProps) {
    super();
    this.dbClient = props.dbClient;
    if (!props.config.entriesTable) {
      throw new Error('ENTRIES_TABLE is required');
    }
    this.entriestableName = props.config.entriesTable;
  }

  async getEntries(
    userId: string,
    filters: FilterEntry
  ): Promise<{ entries: Entry[]; lastEvaluatedKey?: Record<string, any> }> {
    let keyConditionExpression = 'userId = :userId AND preachingDate BETWEEN :startDate AND :endDate';
    const expressionAttributeValues: Record<string, any> = {
      ':userId': userId,
      ':startDate': filters.startDate,
      ':endDate': filters.endDate,
    };

    let startKey: Record<string, any> | undefined = undefined;
    const hasNextCursor = !!filters.nextCursor
    if (hasNextCursor) {
      filters.decodeCursor();
      startKey = filters.nextCursor as Record<string, any>;
    }

    const command = new QueryCommand({
      TableName: this.entriestableName,
      IndexName: 'userIdIndex',
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: false,
      Limit: filters.limit,
      ExclusiveStartKey: startKey,
    });

    const response = await this.dbClient.send(command);
    const items = response.Items || [];

    return {
      entries: items.map(item => new Entry({
        ...item,
        user: new User({ id: item.userId })
      })),
      lastEvaluatedKey: response.LastEvaluatedKey,
    };
  }

  async getEntryById(userId: string, id: string): Promise<Entry | null> {
    const command = new GetCommand({
      TableName: this.entriestableName,
      Key: { userId, id },
    });

    const response = await this.dbClient.send(command);
    const item = response.Item as PreachingEntry | undefined;
    return item ? new Entry({
      ...item,
      user: new User({ id: item.userId })
    }) : null;
  }

  async createEntry(entry: Entry): Promise<Entry> {
    const id = this.generateUUID();
    const createdAt = this.getTimestamp();

    const dbItem: PreachingEntry = {
      id,
      userId: entry.user.id,
      preachingDate: entry.preachingDate,
      hours: entry.hours,
      minutes: entry.minutes,
      type: entry.type,
      notes: entry.notes,
      createdAt,
    };

    await this.dbClient.send(new PutCommand({
      TableName: this.entriestableName,
      Item: dbItem,
      ConditionExpression: "attribute_not_exists(id)"
    }));

    return new Entry({
      ...entry,
      id,
      createdAt,
    });
  }

  async updateEntry(entry: Entry): Promise<Entry> {
    const updatedAt = this.getTimestamp();

    const dbItem: PreachingEntry = {
      id: entry.id,
      userId: entry.user.id,
      preachingDate: entry.preachingDate,
      hours: entry.hours,
      minutes: entry.minutes,
      type: entry.type,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt,
    };

    await this.dbClient.send(new PutCommand({
      TableName: this.entriestableName,
      Item: dbItem,
    }));

    return new Entry({
      ...entry,
      updatedAt,
    });
  }

  async deleteEntry(userId: string, id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.entriestableName,
      Key: { userId, id },
    });

    await this.dbClient.send(command);
  }
}
