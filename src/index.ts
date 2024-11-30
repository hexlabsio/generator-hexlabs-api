import chalk from 'chalk';
import * as child_process from 'node:child_process';
import Generator from 'yeoman-generator';
import type { BaseOptions } from 'yeoman-generator/dist/types';

type ThingGeneratorOpts = BaseOptions & {
  name: string;
}

export default class APIGenerator extends Generator<ThingGeneratorOpts> {
  private answers: {
    namespace: string;
    port: string;
    name: string;
    deployment: 'cfts' | 'cdktf';
    githubOrg: string;
    domain: string;
    numEnvs: number;
    databaseTechnology: 'DynamoDB' | 'None';
    httpLibrary: 'hexlabs' | 'middy';
    environments: { name: string; account: string; prefix: string; region: string }[]
    model: {
      capital: string;
      lower: string;
    },
    naming: {
      namespace: string;
      name: string;
      apiClass: string;
    },
    capitalize(text: string): string;
  };
  constructor(args: string | string[], opts: ThingGeneratorOpts) {
    super(args, opts);
    (this.env as any).options.nodePackageManager = "npm";
  }

  async prompting() {
    this.answers = await this.prompt([
      {
        type: "list",
        name: "deployment",
        message: "Would would you like to use for deploying infrastructure",
        default: "cdktf",
        choices: [
          { name: '@hexlabs/cloudformation-ts (cfts)', value: 'cfts' },
          { name: 'Terraform (cdktf)', value: 'cdktf' },
        ]
      },
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
        default: "account"
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
        type: "list",
        name: "databaseTechnology",
        message: "Would you like to use a data source?",
        default: "DynamoDB",
        choices: [
          { name: 'DynamoDB', value: 'DynamoDB' },
          { name: 'None', value: 'none' },
        ]
      },
      {
        type: "number",
        name: "numEnvs",
        message: "How many environments do you want?",
        default: "2"
      }
    ]);
    this.answers.environments = [];
    for(let i = 0;i< this.answers.numEnvs; i++) {
      const environment = await this.prompt([
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
      this.answers.environments.push(environment);
    }
    this.answers.capitalize = (text: string) => text.substring(0, 1).toUpperCase() +text.substring(1).toLowerCase();
    this.answers.naming = {
      name: this.answers.name,
      namespace: this.answers.namespace,
      apiClass: `${this.answers.capitalize(this.answers.namespace)}${this.answers.capitalize(this.answers.name)}Api`
    }
    this.answers.model = {
      capital: this.answers.capitalize(this.answers.name),
      lower: this.answers.name.toLowerCase(),
    }
  }

  install() {
  }

  private _mapFiles(...files: string[]) {
    files.forEach(file =>
      this.fs.copyTpl(this.templatePath(`${file}.tpl`), this.destinationPath(file), {...this.answers})
    );
  }

  private _filesForDataSource() {
    if(this.answers.databaseTechnology === 'DynamoDB'){
      this._mapFiles("jest-setup.ts")
    }
  }

  private _stackEnvFiles(props: any) {
    if (this.answers.deployment === 'cfts') {
      this.fs.copyTpl(this.templatePath('cfts-stack/certificate/properties/environment.json'), this.destinationPath(`stack/certificate/properties/${props.environment.name}.json`), props, {});
      this.fs.copyTpl(this.templatePath('cfts-stack/service-properties/environment.json'), this.destinationPath(`stack/${this.answers.name}-service/properties/${props.environment.name}.json`), props, {});
    } else {
      this.fs.copyTpl(this.templatePath('cdktf-stack/variables/environment.tfvars'), this.destinationPath(`stack/variables/${props.environment.name}.tfvars`), props, {});
    }
  }

  private _stackFiles() {
    if (this.answers.deployment === 'cfts') {
      this.fs.copyTpl(this.templatePath('cfts-stack/certificate/template.ts'), this.destinationPath(`stack/certificate/template.ts`), {...this.answers}, {});
      this.fs.copyTpl(this.templatePath('cfts-stack/service'), this.destinationPath(`stack/${this.answers.name}-service`), {...this.answers}, {});
    } else {
      this.fs.copyTpl(this.templatePath('cdktf-stack/stack'), this.destinationPath(`stack`), this.answers, {});
    }
  }

  writing() {
    this._filesForDataSource();
    const isHexlabs = this.answers.httpLibrary === 'hexlabs';
    this._mapFiles('.env', '.gitignore', 'jest.config.js', 'package.json', 'README.md', 'rollup.config.ts', 'tsconfig.json');
    this.fs.copyTpl(this.templatePath(isHexlabs ? 'api/hexlabs.ts.tpl': 'api/middy.ts.tpl', ), this.destinationPath('src/api/index.ts'), {...this.answers}, {})
    this.fs.copyTpl(this.templatePath(isHexlabs ? 'api/index-hexlabs.ts.tpl': 'api/index-middy.ts.tpl', ), this.destinationPath('src/index.ts'), {...this.answers}, {})
    this.fs.copyTpl(this.templatePath('src'), this.destinationPath('src'), {...this.answers}, {})
    this.fs.copyTpl(this.templatePath('sdk'), this.destinationPath('sdk'), {...this.answers}, {})
    this.answers.environments.forEach((environment, index, list) => {
      const previous = index > 0 ? list[index - 1] : undefined;
      const isFirst = index === 0;
      const isSecond = index === 1;
      const props= {
        ...this.answers,
        environment: {
          ...environment,
          isFirst,
          isSecond,
          previous: previous?.name,
          domain: (environment.prefix ? `${environment.prefix}.` : '') + this.answers.domain
        }
      };
      this.fs.copyTpl(this.templatePath('.github/workflows/release.yml'), this.destinationPath(`.github/workflows/release-${environment.name}.yml`), props, {});
      this._stackEnvFiles(props);
    });
    this.fs.copyTpl(this.templatePath('.github/workflows/build.yml'), this.destinationPath(`.github/workflows/build.yml`), {...this.answers}, {});
    this.fs.copyTpl(this.templatePath('.github/workflows/pull-request-checks.yml'), this.destinationPath(`.github/workflows/pull-request-checks.yml`), {...this.answers}, {});
    this._stackFiles();
  }

  end() {
    child_process.execSync('npm run prebuild');
    console.log(chalk.green(
      '          _______           _        _______  ______   _______ \n' +
      '|\\     /|(  ____ \\|\\     /|( \\      (  ___  )(  ___ \\ (  ____ \\\n' +
      '| )   ( || (    \\/( \\   / )| (      | (   ) || (   ) )| (    \\/\n' +
      '| (___) || (__     \\ (_) / | |      | (___) || (__/ / | (_____ \n' +
      '|  ___  ||  __)     ) _ (  | |      |  ___  ||  __ (  (_____  )\n' +
      '| (   ) || (       / ( ) \\ | |      | (   ) || (  \\ \\       ) |\n' +
      '| )   ( || (____/\\( /   \\ )| (____/\\| )   ( || )___) )/\\____) |\n' +
      '|/     \\|(_______/|/     \\|(_______/|/     \\||/ \\___/ \\_______)\n' +
      '                                                               '))
    console.log(chalk.green('Complete! Try running '), chalk.yellow(`cd ${this.destinationPath('.')} && npm start`), chalk.green('to start the service locally.'));
  }
}
