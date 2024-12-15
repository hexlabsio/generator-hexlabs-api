import Generator from 'yeoman-generator/dist';
import { ThingCreator, Type } from './thing-creator.js';
import { WebAnswers, WebPrompter } from './web-answers.js';

export class Web extends ThingCreator<WebAnswers>{
  constructor(protected creator: Generator<any>) {
    super('web', creator);
  }

  async ask(type: Type) {
    this.answers = await WebPrompter.ask(this.creator, type);
  }

  mapUi(files: (string | {src: string; dest: string})[], props?: any) {
    this.map(files.map(it => {
      if(typeof it === 'string') return 'ui/' + it;
      return {src: 'ui/' + it.src, dest: 'ui/' + it.dest};
    }), props)
  }

  mapEdge(files: (string | {src: string; dest: string})[], props?: any) {
    this.map(files.map(it => {
      if(typeof it === 'string') return 'edge/' + it;
      return {src: 'edge/' + it.src, dest: 'edge/' + it.dest};
    }), props)
  }

  async write() {
    this.answers.name = 'edge';
    this.mapEdge([
      '.github/actions',
      '.github/actions',
      '.github/workflows/build.yml',
      '.github/workflows/pull-request-checks.yml',
      'src',
      'stack',
      '.gitignore',
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      ]
    );
    this.forEachEnvironment(props => {
      this.mapEdge([
          {src: `.github/workflows/release.yml`, dest: `.github/workflows/release-${props.environment.name}.yml`},
          {src: 'variables/environment.tfvars', dest: `stack/variables/${props.environment.name}.tfvars`}
        ], props
      );
    })
  }

  end() {
  }
}
