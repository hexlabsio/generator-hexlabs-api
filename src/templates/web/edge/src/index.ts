import { CloudFrontRequestCallback, CloudFrontRequestEvent, Context } from 'aws-lambda';

export const handler = (event: CloudFrontRequestEvent, _: Context, callback: CloudFrontRequestCallback): void => {
    console.log('Received request');
    const request = event.Records[0].cf.request;
    const requestHost = request.headers.host[0].value;
    if (requestHost.startsWith('www.')) {
        const response = {
            status: '301',
            statusDescription: 'Moved Permanently',
            headers: {
                location: [
                    {
                        key: 'Location',
                        value: 'https://' + requestHost.replace(/^(www\.)/, '') + request.uri,
                    },
                ],
                'cache-control': [
                    {
                        key: 'Cache-Control',
                        value: 'max-age=31536000',
                    },
                ],
            },
        };
        console.log('Request starts with www returning 301 redirect response', response);
        callback(null, response);
    }

    const isSupportedFile = request.uri.endsWith('.js') || request.uri.endsWith('.html') || request.uri.endsWith('.css') || request.uri.endsWith('.svg');
    if (request.headers && isSupportedFile) {
        console.log('Request supports compression');
        let gz = false;
        let br = false;
        const ae = request.headers['accept-encoding'];
        if (ae) {
            for (let i = 0; i < ae.length; i++) {
                const { value } = ae[i];
                const bits = value.split(/\s*,\s*/);
                if (bits.includes('br')) {
                    console.log('Request includes br');
                    br = true;
                    break;
                } else if (bits.includes('gzip')) {
                    console.log('Request includes gzip');
                    gz = true;
                    break;
                }
            }
        }

        if (br) {
            request.uri += '.br';
            console.log('Updated request with br', request.uri);
        } else if (gz) {
            request.uri += '.gz';
            console.log('Updated request with gzip', request.uri);
        }
    } else {
        console.log('Request is html request');
        request.uri = '/index.html';
    }

    console.log('Returning request', request);
    callback(null, request);
};
