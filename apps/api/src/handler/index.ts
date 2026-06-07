import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { entriesController } from '../controllers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const httpMethod = event.httpMethod.toUpperCase();
  const path = event.path || '';
  const resource = event.resource || '';

  try {
    const isEntriesPath = resource === '/entries' ||
      path === '/entries' ||
      resource === '/entries/{id}' ||
      path.startsWith('/entries/');

    if (isEntriesPath) {
      const hasIdParam = event.pathParameters && event.pathParameters.id;
      if (hasIdParam) {
        if (httpMethod === 'DELETE') {
          return await entriesController.deleteEntry(event);
        }
        if (httpMethod === 'PUT') {
          return await entriesController.updateEntry(event);
        }
      } else {
        if (httpMethod === 'GET') {
          return await entriesController.getEntries(event);
        }
        if (httpMethod === 'POST') {
          return await entriesController.createEntry(event);
        }
      }
    }

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'NOT_FOUND',
        message: `Resource not found at path ${path} with method ${httpMethod}.`,
      }),
    };
  } catch (err) {
    console.error('Fatal handler error:', err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while processing your request.',
      }),
    };
  }
};
