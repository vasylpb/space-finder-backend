import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { join } from "path";
import {
  AuthorizationType,
  LambdaIntegration,
  MethodOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { GenericTable } from "./GenericTable";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { AuthorizerWrapper } from "./auth/AuthorizerWrapper";

export class SpaceStack extends Stack {
  private api = new RestApi(this, "SpaceApi");
  private spacesTable = new GenericTable(this, {
    tableName: "SpacesTable",
    primaryKey: "spaceId",
    createLambdaPath: "Create",
    readLambdaPath: "Read",
    updateLambdaPath: "Update",
    deleteLambdaPath: "Delete",
    secondaryIndexes: ["location"],
  });
  private authorizer: AuthorizerWrapper;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.authorizer = new AuthorizerWrapper(this, this.api);

    const helloLambdaNode = new NodejsFunction(this, "helloLambdaNode", {
      entry: join(__dirname, "..", "services", "node-lambda", "hello.ts"),
      handler: "handler",
    });

    // Add bucket policy
    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions("s3:ListAllMyBuckets");
    s3ListPolicy.addResources("*");

    helloLambdaNode.addToRolePolicy(s3ListPolicy);

    // Auth options
    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId,
      },
    };

    // Hello Api lambda integration with gateway
    const helloLambdaIntegration = new LambdaIntegration(helloLambdaNode);
    const helloLambdaResource = this.api.root.addResource("hello");
    helloLambdaResource.addMethod(
      "GET",
      helloLambdaIntegration,
      optionsWithAuthorizer
    );

    // Spaces DB integrations:
    const spaceResource = this.api.root.addResource("spaces");
    spaceResource.addMethod("POST", this.spacesTable.createLambdaIntegration);
    spaceResource.addMethod("GET", this.spacesTable.readLambdaIntegration);
    spaceResource.addMethod("PUT", this.spacesTable.updateLambdaIntegration);
    spaceResource.addMethod("DELETE", this.spacesTable.deleteLambdaIntegration);
  }
}
