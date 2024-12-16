import { DataArchiveFile } from '@cdktf/provider-archive/lib/data-archive-file';
import { ArchiveProvider } from '@cdktf/provider-archive/lib/provider';
import { AcmCertificate } from '@cdktf/provider-aws/lib/acm-certificate';
import { AcmCertificateValidation } from '@cdktf/provider-aws/lib/acm-certificate-validation';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Object } from '@cdktf/provider-aws/lib/s3-object';
import { Construct } from "constructs";
import { App, TerraformStack, S3Backend } from "cdktf";
import { edgeLambdaRole } from './iam';
import { edgeLambda } from './lambda';
import { variables, Variables } from './variables';
import { createWebsite } from './website';

class Stack extends TerraformStack {

  readonly globalProvider: AwsProvider;
  readonly vars: Variables;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.vars = variables(this);

    new S3Backend(this, {
      region: 'us-east-1',
      key: 'link-ui-edge/state.tfstate',
      dynamodbTable: 'terrraform-lock',
      encrypt: true
    } as any);

    new AwsProvider(this, "EUWest1", {region: 'eu-west-1'});
    new ArchiveProvider(this, "Archive");
    this.globalProvider = new AwsProvider(this, "USEast1", {region: 'us-east-1', alias: 'us-east-1'});

    this.stack();
  }

  webCertificate(): AcmCertificateValidation {
    const certificate =  new AcmCertificate(this, "web-certificate", {
      provider: this.globalProvider,
      domainName: this.vars.domain,
      subjectAlternativeNames: [this.vars.domain, 'www.' + this.vars.domain],
      validationOption: [{domainName: this.vars.domain, validationDomain: this.vars.domain}],
      validationMethod: 'DNS'
    });
    return new AcmCertificateValidation(this, "web-certificate-validation", {
      provider: this.globalProvider,
      certificateArn: certificate.arn
    })
  }

  lambdaPackage(): { archive: DataArchiveFile, key: string }{
    const archive = new DataArchiveFile(this, "edge-lambda-zip", {
      type: 'zip',
      sourceDir: '../../../build',
      outputPath: '../../../dist.zip',
    });
    const code = new S3Object(this, "edge-lambda-code", {
      provider: this.globalProvider,
      source: archive.outputPath,
      bucket: this.vars.code_s3_bucket,
      key: `${this.vars.namespace}/${this.vars.name}-${this.vars.environment}.dist`,
      etag: archive.outputMd5
    })
    return { archive, key: code.key};
  }

  stack() {
    const archive = this.lambdaPackage();
    const role = edgeLambdaRole(this);
    const edge = edgeLambda(this, this.globalProvider, archive.archive.outputBase64Sha256, archive.key, this.vars, role);
    const cert = this.webCertificate()
    createWebsite(this, this.vars, edge.qualifiedArn, cert.certificateArn);
  }
}

const app = new App();
new Stack(app, "stack");
app.synth();
