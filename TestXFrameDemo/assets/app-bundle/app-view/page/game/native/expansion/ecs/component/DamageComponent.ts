import { ecsclass, EcsComponent } from 'db://pkg/@gamex/cc-ecs';
import { MyEntity } from '../entity/MyEntity';

@ecsclass('DamageComponent')
export class DamageComponent extends EcsComponent<MyEntity> {
    static allowRecycling = true;
    protected onDisable() {
        this.attack = 1;
    }

    attack = 1;
}