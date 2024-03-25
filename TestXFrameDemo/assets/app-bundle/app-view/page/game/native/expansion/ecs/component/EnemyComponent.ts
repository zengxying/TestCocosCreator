import { Label } from 'cc';
import { ecsclass, EcsComponent } from 'db://pkg/@gamex/cc-ecs';
import { MyEntity } from '../entity/MyEntity';

@ecsclass('EnemyComponent')
export class EnemyComponent extends EcsComponent<MyEntity> {
    static allowRecycling = true;
    protected onDisable() {
        this._blood = 1;
    }

    private _blood = 1;
    public get blood() {
        return this._blood;
    }
    public set blood(value) {
        this.entity.node.getChildByName('blood').getComponent(Label).string = value.toString();
        this._blood = value;
    }
}