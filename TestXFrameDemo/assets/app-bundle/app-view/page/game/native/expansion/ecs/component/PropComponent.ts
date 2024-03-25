import { Label } from 'cc';
import { ecsclass, EcsComponent } from 'db://pkg/@gamex/cc-ecs';
import { MyEntity } from '../entity/MyEntity';

enum Type {
    None,
    Attack,
    Speed,
    Split
}

@ecsclass('PropComponent')
export class PropComponent extends EcsComponent<MyEntity> {
    static allowRecycling = true;
    protected onDisable() {
        this._type = Type.None;
        this.value = 1;
    }

    static Type = Type;
    private _type = Type.None;
    public get type() {
        return this._type;
    }
    public set type(value) {
        if (value === Type.Attack) {
            this.entity.node.getChildByName('desc').getComponent(Label).string = '攻击力';
        } else if (value === Type.Speed) {
            this.entity.node.getChildByName('desc').getComponent(Label).string = '攻击速度';
        } else {
            this.entity.node.getChildByName('desc').getComponent(Label).string = '攻击分裂';
        }
        this._type = value;
    }
    value = 1;
}