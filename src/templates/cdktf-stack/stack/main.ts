import { DataArchiveFile } from '@cdktf/provider-archive/lib/data-archive-file';
import { ArchiveProvider } from '@cdktf/provider-archive/lib/provider';
import { AcmCertificate } from '@cdktf/provider-aws/lib/acm-certificate';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Object } from '@cdktf/provider-aws/lib/s3-object';
import { Construct } from "constructs";
import { App, TerraformStack, S3Backend } from "cdktf";
import { apiGateway } from './api';
import { createTables, DynamoTables } from './dynamo';
import { apiLambda } from './lambda';
import { variables, Variables } from './variables';

class Stack extends TerraformStack {

  readonly globalProvider: AwsProvider;
  readonly vars: Variables;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.vars = variables(this);

    new S3Backend(this, {
      region: 'us-east-1',
      key: '<%= namespace %>-<%= name %>-service/state.tfstate',
      dynamodbTable: 'terrraform-lock',
      encrypt: true
    } as any);

    new AwsProvider(this, "EUWest1", {region: 'eu-west-1'});
    new ArchiveProvider(this, "Archive");
    this.globalProvider = new AwsProvider(this, "USEast1", {region: 'us-east-1', alias: 'us-east-1'});

    this.stack();
  }

  apiCertificate(apiPrefix: string, domain: string): AcmCertificate {
    return new AcmCertificate(this, "ApiCertificate", {
      domainName: [apiPrefix, 'api', domain].join('.'),
      subjectAlternativeNames: [domain],
      validationOption: [{domainName: domain, validationDomain: domain}],
      validationMethod: 'DNS'
    });
  }

  lambda(tables: DynamoTables){
    const archive = new DataArchiveFile(this, "ApiLambdaZip", {
      type: 'zip',
      sourceDir: '../../../build',
      outputPath: '../../../dist.zip',
    });
    const code = new S3Object(this, "ApiLambdaCode", {
      source: archive.outputPath,
      bucket: this.vars.code_s3_bucket,
      key: `${this.vars.namespace}/${this.vars.name}-${this.vars.environment}.dist`,etag: archive.outputMd5
    })
    return apiLambda(this, archive.outputBase64Sha256, this.vars.code_s3_bucket, code.key, this.vars, tables);
  }

  stack() {
    const tables: DynamoTables = createTables(this, this.vars, { <%= name %>Table: '<%= name %>' })
    const certificate = this.apiCertificate(this.vars.name, this.vars.domain);
    const lambda = this.lambda(tables);
    const api = apiGateway(this, certificate.arn, this.vars, lambda);
  }
}

const app = new App();
new Stack(app, "stack");
app.synth();
