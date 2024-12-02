import { Apigatewayv2Api } from '@cdktf/provider-aws/lib/apigatewayv2-api';
import { Apigatewayv2ApiMapping } from '@cdktf/provider-aws/lib/apigatewayv2-api-mapping';
import { Apigatewayv2DomainName } from '@cdktf/provider-aws/lib/apigatewayv2-domain-name';
import { Apigatewayv2Integration } from '@cdktf/provider-aws/lib/apigatewayv2-integration';
import { Apigatewayv2Route } from '@cdktf/provider-aws/lib/apigatewayv2-route';
import { Apigatewayv2Stage } from '@cdktf/provider-aws/lib/apigatewayv2-stage';
import { CloudwatchLogGroup } from '@cdktf/provider-aws/lib/cloudwatch-log-group';
import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function';
import { LambdaPermission } from '@cdktf/provider-aws/lib/lambda-permission';
import { Construct } from 'constructs';
import { Variables } from './variables';

export function apiGateway(scope: Construct, certificateArn: string, variables: Variables, lambda: LambdaFunction): Apigatewayv2Api {
  const gateway = new Apigatewayv2Api(scope, 'api', {
    name: `${variables.namespace}-${variables.name}-api`,
    protocolType: 'HTTP'
  });

  const logs = new CloudwatchLogGroup(scope, 'api-logs', {
    name: `/aws/api-gw/${gateway.name}`,
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

  const permission = new LambdaPermission(scope, 'permission', {
    statementId: 'AllowExecutionFromAPIGateway',
    action: "lambda:InvokeFunction",
    functionName: lambda.functionName,
    principal: "apigateway.amazonaws.com",
    sourceArn: `${gateway.executionArn}/*/*`
  });

  const integration = new Apigatewayv2Integration(scope, 'integration', {
    apiId: gateway.id,
    integrationType: "AWS_PROXY",
    integrationUri: lambda.invokeArn
  })

  const route = new Apigatewayv2Route(scope, 'route', {
    apiId: gateway.id,
    routeKey: "GET /<%= name %>/{<%= name %>Id}",
    target: `integrations/${integration.id}`
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
