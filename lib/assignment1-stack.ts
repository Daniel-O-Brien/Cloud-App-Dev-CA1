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

    // const table = new dynamodb.Table(this, "table", {
    //   billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    //   partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   tableName: "Table"
    // })

    const moviesTable = new dynamodb.Table(this, "MoviesTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Movies"
  });

    const actorsTable = new dynamodb.Table(this, "actorsTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "name", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Actors",
 });

    const castsTable = new dynamodb.Table(this, "castTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "movie_id", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "role_name", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Cast",
 });

    const awardsTable = new dynamodb.Table(this, "awardsTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Awards",
 });

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
        TABLE_NAME: moviesTable.tableName,
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
          TABLE_NAME: moviesTable.tableName,
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
            [moviesTable.tableName]: generateBatch(movies),
            [actorsTable.tableName]: generateBatch(actors),
            [castsTable.tableName]: generateBatch(casts),
            [awardsTable.tableName]: generateBatch(awards),
 },
 },
        physicalResourceId: custom.PhysicalResourceId.of("moviesddbInitData")
 },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [moviesTable.tableArn, actorsTable.tableArn, castsTable.tableArn, awardsTable.tableArn]
 }),
 });

 moviesTable.grantReadData(getMovieByIdFn)
 moviesTable.grantReadWriteData(newMovieFn)

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

}}https://ui81d76hfi.execute-api.eu-west-1.amazonaws.com/dev
