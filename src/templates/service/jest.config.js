import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

<% if(databaseTechnology === 'DynamoDB') { %>process.env['JEST_DYNAMODB_CONFIG'] = `${__dirname}/dynamodb-tables.cjs`<% } %>

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
    testEnvironment: "node",
    preset: 'ts-jest/presets/default-esm',
<% if(databaseTechnology === 'DynamoDB') { %>    globalSetup: "./node_modules/@shelf/jest-dynamodb/lib/setup.js",
    globalTeardown: "./node_modules/@shelf/jest-dynamodb/lib/teardown.js",<% } %>
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true
            },
        ],
    },
}

export default config;
