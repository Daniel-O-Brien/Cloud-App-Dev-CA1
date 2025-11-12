import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { generateBatch } from "../shared/util";
import { movies } from "../seed/movies";
import { actors } from "../seed/actors";
import { casts } from "../seed/casts";
import { awards } from "../seed/awards";
import * as apig from "aws-cdk-lib/aws-apigateway";

export class Assignment1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "table", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Table"
    })

      const api = new apig.RestApi(this, "RestAPI", {
      description: "Assignment1",
      deployOptions: {
        stageName: "dev",
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type", "X-Amz-Date"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
        allowOrigins: ["*"],
      },
    });

    const newMovieFn = new lambdanode.NodejsFunction(this, "AddMovieFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/addMovie.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: table.tableName,
        REGION: cdk.Aws.REGION,
      },
    });

    const getMovieByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getMovieById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: table.tableName,
          REGION: cdk.Aws.REGION,
        },
      }
      );

    const deleteMovieFn = new lambdanode.NodejsFunction(this, "DeleteMovieFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `${__dirname}/../lambdas/deleteMovie.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: table.tableName,
        REGION: cdk.Aws.REGION,
      },
    });

        const getMovieCastMembersFn = new lambdanode.NodejsFunction(
      this,
      "GetCastMembersFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getMovieCastMembers.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: table.tableName,
          REGION: cdk.Aws.REGION,
        },
      }
 );

     new custom.AwsCustomResource(this, "moviesddbInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [table.tableName]: generateBatch([...movies, ...actors, ...casts, ...awards])
 },
 },
        physicalResourceId: custom.PhysicalResourceId.of("moviesddbInitData")
 },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [table.tableArn]
 }),
 });

  table.grantReadData(getMovieByIdFn)
  table.grantReadWriteData(newMovieFn)
  table.grantReadWriteData(deleteMovieFn)
  table.grantReadData(getMovieCastMembersFn);

    const moviesEndpoint = api.root.addResource("movies");
    moviesEndpoint.addMethod(
      "POST",
      new apig.LambdaIntegration(newMovieFn, { proxy: true })
    );

    const movieEndpoint = moviesEndpoint.addResource("{movieId}");
    movieEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getMovieByIdFn, { proxy: true })
    );
  
      movieEndpoint.addMethod(
      "DELETE",
      new apig.LambdaIntegration(deleteMovieFn, { proxy: true })
    )

    const movieCastEndpoint = movieEndpoint.addResource("actors");
movieCastEndpoint.addMethod(
    "GET",
    new apig.LambdaIntegration(getMovieCastMembersFn, { proxy: true })
);
  
  }}