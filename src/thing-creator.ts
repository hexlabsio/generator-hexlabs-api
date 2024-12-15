import child_process from 'node:child_process';
import Generator from 'yeoman-generator';

export type Type = 'user' | 'general' | 'ui'

export type DefaultAnswers = {
  type: Type;
  githubOrg: string;
  namespace: string;
  name: string;
  domain: string;
  numEnvs: number;
  environments: { name: string; account: string; prefix: string; region: string }[];
  capitalize(text: string): string;
}

export abstract class ThingCreator<A extends DefaultAnswers> {

  protected answers: A;

  protected constructor(
    public template: 'service' | 'web',
    protected creator: Generator<any>
  ) {
  }

  map(files: (string | {src: string; dest: string})[], props?: any) {
    files.forEach(file => {
        if(typeof file === 'string')
          this.creator.fs.copyTpl(this.creator.templatePath(this.template + '/' + file), this.creator.destinationPath(file), props ?? this.answers);
        else this.creator.fs.copyTpl(this.creator.templatePath(this.template + '/' + file.src), this.creator.destinationPath(file.dest), props ?? this.answers);
      }
    );
  }

  abstract ask(type: Type): Promise<void>;
  abstract write(): Promise<void>;

  end() {
    child_process.execSync('npm run prebuild');
  }

  forEachEnvironment(map: (props: A & {environment: { name: string; isFirst: boolean; isSecond: boolean; previous?: string; domain: string }}) => void) {
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
      map(props);
    });
  }


}
