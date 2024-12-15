import { Apigatewayv2Api } from '@cdktf/provider-aws/lib/apigatewayv2-api';
import { Apigatewayv2ApiMapping } from '@cdktf/provider-aws/lib/apigatewayv2-api-mapping';
import { Apigatewayv2DomainName } from '@cdktf/provider-aws/lib/apigatewayv2-domain-name';
import { Apigatewayv2Stage } from '@cdktf/provider-aws/lib/apigatewayv2-stage';
import { CloudwatchLogGroup } from '@cdktf/provider-aws/lib/cloudwatch-log-group';
import { CognitoUserPool } from '@cdktf/provider-aws/lib/cognito-user-pool';
import { CognitoUserPoolClient } from '@cdktf/provider-aws/lib/cognito-user-pool-client';
import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function';
import { LambdaPermission } from '@cdktf/provider-aws/lib/lambda-permission';
import { Construct } from 'constructs';
import { Variables } from './variables';
import oas from '../generated/<%= namespace %>-<%= name %>-api/oas.json'


export function apiGateway(scope: Construct, certificateArn: string, variables: Variables, lambda: LambdaFunction, pool: CognitoUserPool, client: CognitoUserPoolClient): Apigatewayv2Api {

  const schemaReplaceVars = {
    functions: { handler: lambda.invokeArn },
    cognitoPoolEndpoint: `https://${pool.endpoint}`,
    cognitoAppClientId: client.id
  }

  const schema = JSON.stringify(oas)
    .replaceAll('${functions.handler}', schemaReplaceVars.functions.handler)
    .replaceAll('${cognitoPoolEndpoint}', schemaReplaceVars.cognitoPoolEndpoint)
    .replaceAll('${cognitoAppClientId}', schemaReplaceVars.cognitoAppClientId);

  const gateway = new Apigatewayv2Api(scope, 'api', {
    name: `${variables.namespace}-${variables.name}-api`,
    protocolType: 'HTTP',
    version: '1.0.0',
    body: schema
  });

  new LambdaPermission(scope, 'api-permissions', {
    sourceArn: `${gateway.executionArn}/*/*/*`,
    statementId: 'AllowApiGateway',
    action: 'lambda:InvokeFunction',
    functionName: lambda.arn,
    principal: 'apigateway.amazonaws.com'
  })

  const logs = new CloudwatchLogGroup(scope, 'api-logs', {
    name: `/aws/api-gw/${variables.namespace}-${variables.name}-api`,
    retentionInDays: 30
  });

  const stage = new Apigatewayv2Stage(scope, 'stage', {
    name: variables.environment,
    apiId: gateway.id,
    autoDeploy: true,
    accessLogSettings: {
      destinationArn: logs.arn,
      format: JSON.stringify({
        requestId: "$context.requestId",
        sourceIp: "$context.identity.sourceIp",
        requestTime: "$context.requestTime",
        protocol: "$context.protocol",
        httpMethod: "$context.httpMethod",
        resourcePath: "$context.resourcePath",
        routeKey: "$context.routeKey",
        status: "$context.status",
        responseLength: "$context.responseLength",
        integrationErrorMessage: "$context.integrationErrorMessage"
      })
    }
  });

  const domainName = new Apigatewayv2DomainName(scope, 'custom-domain', {
    domainName: `${variables.name}.api.${variables.domain}`,
    domainNameConfiguration: {
      certificateArn,
      endpointType: 'REGIONAL',
      securityPolicy: 'TLS_1_2'
    }
  });

  new Apigatewayv2ApiMapping(scope, 'mapping', {
    apiId: gateway.id,
    domainName: domainName.domainName,
    stage: stage.name
  })

  return gateway;
}
