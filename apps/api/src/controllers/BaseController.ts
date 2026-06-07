import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export abstract class BaseController {
  protected getUserId(event: APIGatewayProxyEvent): string {
    const claims = event.requestContext.authorizer?.claims;
    const userId = claims?.sub || claims?.username;
    if (!userId) {
      const error = new Error('Unauthorized: Missing user identification.');
      (error as any).code = 'UNAUTHORIZED';
      throw error;
    }
    return userId;
  }

  protected buildResponse(statusCode: number, body: any): APIGatewayProxyResult {
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };
  }

  protected handleError(err: any): APIGatewayProxyResult {
    console.error('API Error:', err);

    let statusCode = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred in the server.';

    const errorCode = err.code || (err as any).name;
    const errorMessage = err.message || '';

    if (errorCode === 'UNAUTHORIZED') {
      statusCode = 401;
      code = 'UNAUTHORIZED';
      message = errorMessage;
    } else if (errorCode === 'NOT_FOUND') {
      statusCode = 404;
      code = 'NOT_FOUND';
      message = errorMessage;
    } else if (
      errorCode === 'VALIDATION_ERROR' ||
      errorMessage.includes('required') ||
      errorMessage.includes('must be') ||
      errorMessage.includes('format') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('cannot be') ||
      errorMessage.includes('exceed')
    ) {
      statusCode = 400;
      code = 'VALIDATION_ERROR';
      message = errorMessage;
    }

    return this.buildResponse(statusCode, { error: code, message });
  }
}
