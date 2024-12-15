import chalk from 'chalk';
import Generator from 'yeoman-generator';
import type { BaseOptions } from 'yeoman-generator/dist/types';
import { Service } from './service.js';
import { ThingCreator } from './thing-creator.js';
import { Web } from './web.js';

type ThingGeneratorOpts = BaseOptions & {
  name: string;
}

export default class APIGenerator extends Generator<ThingGeneratorOpts> {

  thing: ThingCreator<any>;

  constructor(args: string | string[], opts: ThingGeneratorOpts) {
    super(args, opts);
    (this.env as any).options.nodePackageManager = "npm";
  }

  async prompting() {
    const type = (await this.prompt([{
      type: 'list',
      name: 'type',
      message: 'What do you want to build',
      default: 'general',
      choices: [
        { name: 'A General Service', value: 'general' },
        { name: 'A User Service', value: 'user' },
        { name: 'A React UI', value: 'ui' },
      ]
    }])).type;

    if(type === 'ui') {
      this.thing = new Web(this);
    } else {
      this.thing = new Service(this);
    }
    await this.thing.ask(type);
  }

  async writing() {
    await this.thing.write();
  }

  end() {
    this.thing.end();
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
