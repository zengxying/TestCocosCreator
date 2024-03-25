import { ecsclass, EcsSingleton } from 'db://pkg/@gamex/cc-ecs';

@ecsclass('InputSingleton')
export class InputSingleton extends EcsSingleton {
    x = 0;
    y = 0;
}