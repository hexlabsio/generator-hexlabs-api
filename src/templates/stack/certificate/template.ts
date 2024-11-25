import { AwsLoader, join, stackOutput } from '@hexlabs/cloudformation-ts';

const templateBuilder = await AwsLoader
  .register('certificatemanager')
  .load()

export default templateBuilder.create('certificate/template.json')
  .params({
    DOMAIN: {type: 'String'},
  })
.build((aws, params) => {
  const certificate = aws.certificatemanager.certificate({
    domainName: join('<%= name %>.api.', params.DOMAIN()),
    subjectAlternativeNames: [params.DOMAIN()],
    domainValidationOptions: [{domainName: params.DOMAIN(), validationDomain: params.DOMAIN()}],
    validationMethod: 'DNS'
  });

  return {
    outputs: {
      '<%= capitalize(namespace) %><%= capitalize(name) %>ApiCert': stackOutput(certificate, 'Certificate for the <%= capitalize(namespace) %> <%= capitalize(name) %> api')
    }
  }
})
