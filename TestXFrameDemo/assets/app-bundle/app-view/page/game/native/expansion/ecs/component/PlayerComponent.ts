import { ecsclass, EcsComponent } from 'db://pkg/@gamex/cc-ecs';
import { MyEntity } from '../entity/MyEntity';

@ecsclass('PlayerComponent')
export class PlayerComponent extends EcsComponent<MyEntity> {
    static allowRecycling = true;
    protected onDisable() {
        this._attack = 1;
        this._speed = 1;
        this._split = 0;
    }

    /**攻击力 */
    private _attack = 1;
    public get attack() {
        return this._attack;
    }
    public set attack(value) {
        if (value > 20) value = 20;
        this._attack = value;
    }
    /**攻速 */
    private _speed = 1;
    public get speed() {
        return this._speed;
    }
    public set speed(value) {
        if (value > 10) value = 10;
        this._speed = value;
    }
    /**分裂 */
    private _split = 0;
    public get split() {
        return this._split;
    }
    public set split(value) {
        if (value > 6) value = 6;
        this._split = value;
    }
    get interval() {
        return 1 / this.speed;
    };
}