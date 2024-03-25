import { EcsSystem, NodeComponent, filter } from 'db://pkg/@gamex/cc-ecs';
import { GameControl } from '../../../../../../../../app-builtin/app-control/GameControl';
import { PlayerComponent } from '../component/PlayerComponent';

export class ShootSystem extends EcsSystem {
    private playerFilter = filter.all(PlayerComponent, NodeComponent);

    private pause = 0;

    protected execute(dt: number): void {
        const playerEntity = this.find(this.playerFilter);
        if (!playerEntity) return;

        this.pause -= dt;
        if (this.pause > 0) return;

        const node = playerEntity.get(NodeComponent);
        const player = playerEntity.get(PlayerComponent);
        this.pause = player.interval;

        GameControl.inst.shoot(node, player);
    }
}

