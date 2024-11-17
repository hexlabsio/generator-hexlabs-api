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
    databaseTechnology: 'DynamoDB' | 'None';
    httpLibrary: 'hexlabs' | 'middy'
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
        type: "input",
        name: "namespace",
        message: "What namespace do you want to have across everything?",
        default: 'hexlabs'
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
        type: "input",
        name: "httpLibrary",
        message: "Which http library would you like? [hexlabs, middy]",
        default: "middy"
      },
      {
        type: "input",
        name: "databaseTechnology",
        message: "Would you like to use a data source? options are [DynamoDB, None]",
        default: "DynamoDB"
      }
    ]);
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

  writing() {
    this._filesForDataSource();
    const isHexlabs = this.answers.httpLibrary === 'hexlabs';
    this._mapFiles('.env', '.gitignore', 'jest.config.js', 'package.json', 'README.md', 'rollup.config.ts', 'tsconfig.json');
    this.fs.copyTpl(this.templatePath(isHexlabs ? 'api/hexlabs.ts.tpl': 'api/middy.ts.tpl', ), this.destinationPath('src/api/index.ts'), {...this.answers}, {})
    this.fs.copyTpl(this.templatePath(isHexlabs ? 'api/index-hexlabs.ts.tpl': 'api/index-middy.ts.tpl', ), this.destinationPath('src/index.ts'), {...this.answers}, {})
    this.fs.copyTpl(this.templatePath(`src`), this.destinationPath('src'), {...this.answers}, {})
  }

  end() {
    child_process.execSync('npm run prebuild');
    console.log(chalk.green('          _______           _        _______  ______   _______ \n' +
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
