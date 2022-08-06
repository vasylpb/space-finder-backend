import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import {
  MissingFieldError,
  validateAsSpaceEntry,
} from "../shared/InputValidator";
import { generateRandomId, getEventBody } from "../shared/Utils";

const TABLE_NAME = process.env.TABLE_NAME;

const dbClient = new DynamoDB.DocumentClient();

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "Hello from DynamoDB",
  };

  try {
    const item = getEventBody(event);

    item.spaceId = generateRandomId();

    validateAsSpaceEntry(item);

    await dbClient.put({ TableName: TABLE_NAME!, Item: item }).promise();

    result.body = JSON.stringify(`Created item with id: ${item.spaceId}`);
  } catch (error: any) {
    result.statusCode = error instanceof MissingFieldError ? 403 : 500;

    result.body = error.message;
  }

  return result;
}

export { handler };
