{
  "name": "@<%= githubOrg %>/<%= namespace %>-service-<%= name %>",
  "version": "0.0.1",
  "type": "module",
  "main": "build/index.mjs",
  "types": "build/index.d.ts",
  "scripts": {
    "prepare": "husky install",
    "prebuild": "schema-api-ts generate --template <%= httpLibrary %> --apiVersion ${API_VERSION:-1.0.0} $(pwd)/src/schema/index.ts",
    "build": "rollup -c rollup.config.ts --configPlugin @rollup/plugin-typescript",
    "start": "run-lambda start --cognito-claims $(pwd)/generated/<%= namespace %>-<%= name %>-api/paths.json handler $(pwd)/src/index.ts",
<% if(deployment === 'cdktf') { %>"init": "terraform -chdir=cdktf.out/stacks/stack init",
    "plan": "terraform -chdir=cdktf.out/stacks/stack plan -var-file ../../../stack/variables/${ENVIRONMENT:-development}.tfvars",<% } %>
<% if(deployment === 'cfts') { %>    "translate": "cloudformation-ts translate $(pwd)/stack/${STACK:-<%= name %>-service}/template.ts",
    "deploy": "cloudformation-ts deploy -r ${REGION} ${ARGS} -f $(pwd)/build -b <%= namespace %>-deploys-${REGION}-${ENVIRONMENT} -p ${NAMESPACE}/ -- ${NAMESPACE}-${ENVIRONMENT} ${STACK}/template.json",
    "deploy:certs": "cloudformation-ts deploy -r ${REGION} ${ARGS} -- ${NAMESPACE}-${ENVIRONMENT} ${STACK}/template.json",<% } %>
    "format:pretty": "prettier --single-quote --trailing-comma all --write './src/**.ts' './src/**/*.ts'",
    "format:lint": "eslint src/**.ts src/**/*.ts --fix",
<% if(databaseTechnology === 'DynamoDB') { %>    "pretest": "npx tsx ./jest-setup.ts",<% } %>
    "test": "export NODE_OPTIONS=--experimental-vm-modules && jest --ci --runInBand --coverage --reporters=default --reporters=jest-junit --passWithNoTests"
  },
  "eslintConfig": {
    "parser": "@typescript-eslint/parser",
    "plugins": [
      "@typescript-eslint"
    ],
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended"
    ],
    "rules": {
      "@typescript-eslint/ban-types": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-non-null-assertion": 0,
      "@typescript-eslint/no-unused-vars": 0
    },
    "root": true
  },
  "dependencies": {
    "@aws-sdk/client-lambda": "^3",<% if(databaseTechnology === 'DynamoDB') { %>
    "@aws-sdk/client-dynamodb": "^3",
    "@aws-sdk/lib-dynamodb": "^3",
    "@aws-sdk/util-dynamodb": "^3",
    "@hexlabs/dynamo-ts": "^6",<% } %>
    "@hexlabs/env-vars-ts": "^2",
    "@hexlabs/invoker": "^1",
    "@hexlabs/lambda-api-ts": "^0",
    <% if(httpLibrary === 'hexlabs') { %>"@hexlabs/http-api-ts": "^2",<% } %><% if(httpLibrary === 'middy') { %>"@middy/core": "^5.5.1",
     "@middy/http-cors": "^5.5.1",
     "@middy/http-error-handler": "^5.5.1",
     "@middy/http-header-normalizer": "^5.5.1",
     "@middy/http-json-body-parser": "^5.5.1",
     "@middy/http-router": "^5.5.1",
     "@middy/validator": "^5.5.1",<% } %>
     "aws-lambda": "^1",
     "uuid": "^9",
     "zod": "^3",
    "zod-to-json-schema": "^3"
  },
  "devDependencies": {
    <% if(deployment === 'cfts') { %>"@hexlabs/cloudformation-ts": "^3",<% } %>
    <% if(deployment === 'cdktf') { %>"@cdktf/provider-archive": "^10.2.0",
    "@cdktf/provider-aws": "19.44.0",<% } %>
    "@hexlabs/lambda-api-runner-ts": "^0",
    "@hexlabs/schema-api-ts": "^4",
    "@rollup/plugin-commonjs": "^25",
    "@rollup/plugin-json": "^6",
    "@rollup/plugin-node-resolve": "^15",
    "@rollup/plugin-typescript": "^11",<% if(databaseTechnology === 'DynamoDB') { %>
    "@shelf/jest-dynamodb": "^3",<% } %>
    "@types/aws-lambda": "^8",
    "@types/jest": "^29",
    "@types/node": "^18",
    "@types/uuid": "^9",
    "@typescript-eslint/eslint-plugin": "^6",
    "@typescript-eslint/parser": "^6",
    "eslint": "^8",
    "husky": "^8",
    "jest": "^29",
    "jest-junit": "^13",
    "prettier": "^3",
    "rollup": "^4",
    "ts-jest": "^29",
    "ts-node": "^10",
    "tslib": "^2",
    "typescript": "^5"
  }
}
