import Generator from 'yeoman-generator';
import { ServiceAnswers, ServicePrompter } from './service-answers.js';
import { ThingCreator, Type } from './thing-creator.js';

export class Service extends ThingCreator<ServiceAnswers>{

  constructor(protected creator: Generator<any>) {
    super('service', creator);
  }

  async ask(type: Type) {
    this.answers = await ServicePrompter.ask(this.creator, type);
  }

  async write() {
    const isHexlabs = this.answers.httpLibrary === 'hexlabs';
    this.map([
      '.env', '.gitignore', 'jest.config.js', 'package.json', 'README.md', 'rollup.config.ts', 'tsconfig.json',
      { src: isHexlabs ? 'api/hexlabs.ts': 'api/middy.ts', dest: 'src/api/index.ts' },
      { src: isHexlabs ? 'api/index-hexlabs.ts': 'api/index-middy.ts', dest: 'src/index.ts' },
      'src',
      'sdk',
      { src: 'cdktf-stack/stack', dest: 'stack' },
      'jest-setup.ts',
      '.github/actions',
      '.github/workflows/build.yml',
      '.github/workflows/pull-request-checks.yml'
      ]
    );
    if(this.answers.type === 'user') {
      this.map([
        {src: 'triggers.ts', dest: 'src/triggers.ts' },
        {src: 'api/claims.ts', dest: 'src/claims.ts' }
      ]
      );
    }
    this.forEachEnvironment(props => {
      this.map([
          {src: `.github/workflows/release.yml`, dest: `.github/workflows/release-${props.environment.name}.yml`},
          {src: 'cdktf-stack/variables/environment.tfvars', dest: `stack/variables/${props.environment.name}.tfvars`}
        ], props
      );
    });
  }
}
