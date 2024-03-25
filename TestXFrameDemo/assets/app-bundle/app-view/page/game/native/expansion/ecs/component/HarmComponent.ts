import { ecsclass, EcsComponent } from 'db://pkg/@gamex/cc-ecs';
import { MyEntity } from '../entity/MyEntity';

@ecsclass('HarmComponent')
export class HarmComponent extends EcsComponent<MyEntity> {
    static allowMultiple = true;
    static allowRecycling = true;
    protected onDisable() {
        this.damage = 1;
    }

    damage = 1;
}