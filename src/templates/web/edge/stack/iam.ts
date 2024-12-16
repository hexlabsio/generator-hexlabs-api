import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment';
import { Construct } from 'constructs';

export function edgeLambdaRole(scope: Construct): IamRole {
  const lambdaRolePolicy = new DataAwsIamPolicyDocument(scope, 'edge-policy', {
    statement: [
      {
        sid: "AllowEdgeInvoke",
        effect: "Allow",
        actions: ["sts:AssumeRole"],
        principals: [{
          type: 'Service',
          identifiers: ['edgelambda.amazonaws.com', 'lambda.amazonaws.com']
        }]
      }
    ]
  });
  const role = new IamRole(scope, "edge-lambda-role", {
    path: '/',
    assumeRolePolicy: lambdaRolePolicy.json
  });
  new IamRolePolicyAttachment(scope, 'lambda-managed-policy', {
    policyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
    role: role.name,
  });
  return role;
}
