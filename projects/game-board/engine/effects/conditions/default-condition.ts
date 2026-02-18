import { ReactiveCondition } from './reactive-condition';

export class DefaultCondition implements ReactiveCondition {
  readonly type = 'default';
  shouldReact(): boolean {
    return false;
  }
}
