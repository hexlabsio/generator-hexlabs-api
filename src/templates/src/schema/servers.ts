import { OASServer } from '@hexlabs/schema-api-ts';

function devServer(): OASServer {
  return {
    url: 'https://user.api.dev.link-ni.com',
    variables: {
      environment: { default: 'dev' },
    },
  };
}

function prodServer(): OASServer {
  return {
    url: 'https://user.api.link-ni.com',
    variables: {
      environment: { default: 'prod' },
    },
  };
}

function localServer(): OASServer {
  return {
    url: 'http://localhost:{port}',
    variables: { environment: { default: 'local' }, port: { default: '4000' } },
  };
}

function servers(): OASServer[] {
  return [devServer(), prodServer(), localServer()];
}

export default servers();
