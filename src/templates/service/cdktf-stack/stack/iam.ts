import { DynamodbTable } from '@cdktf/provider-aws/lib/dynamodb-table';
import { IamRole, IamRoleInlinePolicyList } from '@cdktf/provider-aws/lib/iam-role';
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment';
import { Construct } from 'constructs';

const lambdaRolePolicy = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
};

export function apiLambdaRole(scope: Construct, tables: DynamodbTable[]): IamRole {
  const role = new IamRole(scope, "api-lambda-role", {
    path: '/',
    assumeRolePolicy: JSON.stringify(lambdaRolePolicy),
    inlinePolicy: [
      {
        name: 'TableAccess',
        policy: JSON.stringify({
          "Statement": [
            {
              "Action": "dynamodb:*",
              "Effect": "Allow",
              "Resource": tables.map(it => it.arn)
            }
          ],
          "Version": "2012-10-17"
        })
      }
    ]
  });
  new IamRolePolicyAttachment(scope, 'lambda-managed-policy', {
    policyArn:
      'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
    role: role.name,
  });
  return role;
}
