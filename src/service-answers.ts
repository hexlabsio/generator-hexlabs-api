import Generator from 'yeoman-generator';
import { DefaultAnswers, Type } from './thing-creator.js';

export type ServiceAnswers = DefaultAnswers & {
  port: string;
  httpLibrary: 'hexlabs' | 'middy';
  model: {
    capital: string;
    lower: string;
  },
  naming: {
    namespace: string;
    name: string;
    apiClass: string;
  }
}

export class ServicePrompter {

  static async ask(generator: Generator<any>, type: Type): Promise<ServiceAnswers> {

    let answers: ServiceAnswers = { type, ...await generator.prompt([
        {
          type: "input",
          name: "githubOrg",
          message: "What organisation will this live under in GitHub",
          default: 'hexlabsio'
        },
        {
          type: "input",
          name: "namespace",
          message: "What namespace do you want to have across everything",
          default: 'hexlabs'
        },
        {
          type: "input",
          name: "domain",
          message: "What domain do you have for this project",
        },
        {
          type: "input",
          name: "port",
          message: "What port would you like the local service to run on",
          default: "4000"
        },
        {
          type: "input",
          name: "name",
          message: "What name do you want to give to this service",
          default: type === 'user' ? 'user' : 'account',
        },
        {
          type: "list",
          name: "httpLibrary",
          message: "Which middleware library would you like?",
          default: "middy",
          choices: [
            { name: 'HexLabs (@hexlabs/http-api-ts)', value: 'hexlabs' },
            { name: 'Middy.js (middy.js.org)', value: 'middy' },
          ]
        },
        {
          type: "number",
          name: "numEnvs",
          message: "How many environments do you want?",
          default: "2"
        }
      ]) };
    answers.environments = [];
    for(let i = 0;i< answers.numEnvs; i++) {
      const environment = await generator.prompt([
          {
            type: "input",
            name: "name",
            message: `What is environment ${i+1} called`,
            default: ["development", "test", "production"][i] ?? "development"
          },
          {
            type: "input",
            name: "prefix",
            message: `What is the domain prefix for environment ${i+1}`,
            default: ""
          },
          {
            type: "input",
            name: "awsAccountId",
            message: `What is the aws account id for environment ${i+1}`,
            default: '12345678910'
          },
          {
            type: "input",
            name: "region",
            message: `What region is environment ${i+1} in`,
            default: 'eu-west-1'
          }
        ]
      );
      answers.environments.push(environment);
    }
    answers.capitalize = (text: string) => text.substring(0, 1).toUpperCase() +text.substring(1).toLowerCase();
    answers.naming = {
      name: answers.name,
      namespace: answers.namespace,
      apiClass: `${answers.capitalize(answers.namespace)}${answers.capitalize(answers.name)}Api`
    }
    answers.model = {
      capital: answers.capitalize(answers.name),
      lower: answers.name.toLowerCase(),
    }
    console.log(answers);
    return answers;
  }
}
