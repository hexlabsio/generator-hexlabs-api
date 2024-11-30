import { TerraformVariable } from 'cdktf';
import { Construct } from 'constructs';

export type Variables = {
  namespace: string;
  name: string;
  environment: string;
  domain: string;
  host: string;
  allowed_origins: string;
  code_s3_bucket: string;
}

export function variables(scope: Construct): Variables {
  return {
    namespace: new TerraformVariable(scope, "namespace", {
      type: "string",
      description: "What name to use for the api",
    }).stringValue,
    name: new TerraformVariable(scope, "name", {
      type: "string",
      description: "What name to use for the api",
    }).stringValue,
    environment: new TerraformVariable(scope, "environment", {
      type: "string",
      description: "What name to use for the api",
    }).stringValue,
    domain: new TerraformVariable(scope, "domain", {
      type: "string",
      description: "What name to use for the api",
    }).stringValue,
    host: new TerraformVariable(scope, "host", {
      type: "string",
      description: "What is the host of the client calling this api for CORS",
    }).stringValue,
    allowed_origins: new TerraformVariable(scope, "allowed_origins", {
      type: "string",
      description: "What origins are allowed for CORS",
    }).stringValue,
    code_s3_bucket: new TerraformVariable(scope, "code_s3_bucket", {
      type: "string",
      description: "What is the host of the client calling this api for CORS",
    }).stringValue,
  }
}
