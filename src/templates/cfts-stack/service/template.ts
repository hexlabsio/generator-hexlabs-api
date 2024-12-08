import { AwsLoader, grantTableAccess, stackOutput } from '@hexlabs/cloudformation-ts';
import { createApi } from './api';
import { createApiLambda } from './lambda';
import { createTables } from './tables';

const templateBuilder = await AwsLoader
  .register('lambda', 'route53','iam', 'apigateway', 'dynamodb', 'events', 'sns', 'cognito')
  .load()

export default templateBuilder.create('<%= name %>-service/template.json')
  .params({
    CodeBucket: {type: 'String'},
    CodeLocation: {type: 'String'},
    DOMAIN: {type: 'String'},
    ALLOWEDORIGINS: {type: 'String'},
    HOST: {type: 'String'},
    ENVIRONMENT: {type: 'String'},
    <%= capitalize(namespace) %><%= capitalize(name) %>ApiCert: { type: 'String' },
    <%= capitalize(namespace) %>HostedZoneId: { type: 'String' }<% if(type !== 'user') { %>,
    <%= capitalize(namespace) %>UserPoolArn: { type: 'String' }<% } %>
  })
  .withCondition('IsProd', ({compare}) => compare.equals({ Ref: 'ENVIRONMENT' }, 'production'))
  .build((aws, params) => {
    const tables = createTables(aws, { <%= name %>Table: '<%= name %>' });
    const codeProps = { s3Bucket: params.CodeBucket(), s3Key: params.CodeLocation()};
    const apiLambda = createApiLambda(aws, codeProps, params.HOST(), params.ALLOWEDORIGINS(), tables)
    grantTableAccess(apiLambda.role, 'TableAccess', Object.values(tables));
    <% if(type === 'user') { %>grantTableAccess(triggerLambda.role, 'TableAccess', Object.values(tables));
    const {userPool} = createUserPool(aws, triggerLambda, params.ENVIRONMENT());
    triggerLambda.grantInvoke(userPool.attributes.Arn(), 'cognito-idp.amazonaws.com')<% } %>
    createApi(aws, params.ENVIRONMENT(), params.LinkHostedZoneId(), params.DOMAIN(), params['<%= capitalize(namespace) %><%= capitalize(name) %>ApiCert'](), apiLambda, <% if(type === 'user') { %>userPool.attributes.Arn()<% } %><% if(type !== 'user') { %>params['<%= capitalize(namespace) %>UserPoolArn']()<% } %>);
})
