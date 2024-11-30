import { DataArchiveFile } from '@cdktf/provider-archive/lib/data-archive-file';
import { ArchiveProvider } from '@cdktf/provider-archive/lib/provider';
import { AcmCertificate } from '@cdktf/provider-aws/lib/acm-certificate';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Object } from '@cdktf/provider-aws/lib/s3-object';
import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { createTables, DynamoTables } from './dynamo';
import { apiLambda } from './lambda';
import { variables, Variables } from './variables';

class MyStack extends TerraformStack {

  readonly globalProvider: AwsProvider;
  readonly vars: Variables;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.vars = variables(this);

    new AwsProvider(this, "EUWest1", {region: 'eu-west-1'});
    new ArchiveProvider(this, "Archive");
    this.globalProvider = new AwsProvider(this, "USEast1", {region: 'us-east-1', alias: 'us-east-1'});

    this.stack();
  }

  apiCertificate(apiPrefix: string, domain: string): AcmCertificate {
    return new AcmCertificate(this, "ApiCertificate", {
      provider: this.globalProvider,
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
      key: `${this.vars.namespace}/${this.vars.name}-${this.vars.environment}.dist`,
    })
    return apiLambda(this, this.vars.code_s3_bucket, code.key, this.vars, tables);
  }

  stack() {
    const tables: DynamoTables = createTables(this, this.vars, { <%= name %>Table: '<%= name %>' })
    const certificate = this.apiCertificate(this.vars.name, this.vars.domain);
    const lambda = this.lambda(tables);
  }
}

const app = new App();
new MyStack(app, "stack");
app.synth();
