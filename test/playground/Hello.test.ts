import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../services/SpacesTable/Create";

const event: APIGatewayProxyEvent = {
  body: {
    name: "1111",
  },
} as any;

handler(event, {} as any).then(apiResult => {
  const items = JSON.parse(apiResult.body);
  console.log("items", items);
});
