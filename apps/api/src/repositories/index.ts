import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDbEntriesRepositoryImp } from './DynamoDbEntriesRepositoryImp';
import { ENTRIES_TABLE } from '..';

const dbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const entriesRepository = new DynamoDbEntriesRepositoryImp({
    dbClient,
    config: {
        entriesTable: ENTRIES_TABLE || '',
    }
});
