import { ecsclass, EcsComponent } from 'db://pkg/@gamex/cc-ecs';
import { MyEntity } from '../entity/MyEntity';

@ecsclass('DestroyComponent')
export class DestroyComponent extends EcsComponent<MyEntity> {
    static allowRecycling = true;
}