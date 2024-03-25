import { ecsclass, EcsComponent } from 'db://pkg/@gamex/cc-ecs';
import { MyEntity } from '../entity/MyEntity';

@ecsclass('CollideComponent')
export class CollideComponent extends EcsComponent<MyEntity> {
    static allowRecycling = true;
}