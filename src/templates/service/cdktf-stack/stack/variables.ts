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
  domain_prefix: string; <% if(type === 'user') { %>
  google_client_id: string;
  google_client_secret: string;
  redirect_uris: string[];<% } %>
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
    domain_prefix: new TerraformVariable(scope, "domain_prefix", {
      type: "string",
      description: "What is the domain prefix for this environment",
    }).stringValue,<% if(type === 'user') { %>
    redirect_uris: new TerraformVariable(scope, "redirect_uri", {
      type: "list(string)",
      description: "What is the redirect_uri for the auth providers",
    }).listValue,
    google_client_id: new TerraformVariable(scope, "google_client_id", {
      type: "string",
      description: "What is client id for the Google client",
    }).stringValue,
    google_client_secret: new TerraformVariable(scope, "google_client_secret", {
      type: "string",
      description: "What is client secret for the Google client",
    }).stringValue,<% } %>
  }
}
