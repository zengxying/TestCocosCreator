import { EcsSystem } from 'db://pkg/@gamex/cc-ecs';
import { GameControl } from '../../../../../../../../app-builtin/app-control/GameControl';

export class EnemySystem extends EcsSystem {
    private pause = 0;

    protected execute(dt: number): void {
        this.pause -= dt;
        if (this.pause > 0) return;
        this.pause = 4;

        GameControl.inst.enemy();
    }
}

