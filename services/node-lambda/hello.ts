import { APIGatewayProxyEvent } from "aws-lambda";

async function handler(event: any, context: any) {
  if (isAuthorized(event)) {
    return {
      statusCode: 200,
      body: JSON.stringify("You are authorized"),
    };
  }
  return {
    statusCode: 401,
    body: JSON.stringify("You are NOT authorized"),
  };
}

function isAuthorized(event: APIGatewayProxyEvent) {
  const groups = event.requestContext.authorizer?.claims["cognito:groups"];
  return groups ? (groups as string).includes("admins") : false;
}

export { handler };
