import { EcsSystem, filter } from 'db://pkg/@gamex/cc-ecs';
import { DestroyComponent } from '../component/DestroyComponent';
import { EnemyComponent } from '../component/EnemyComponent';
import { HarmComponent } from '../component/HarmComponent';

export class HarmSystem extends EcsSystem {
    private harmFilter = filter.all(HarmComponent);

    protected execute(dt: number): void {
        this.query(this.harmFilter).forEach((entity) => {
            const harm = entity.get(HarmComponent);
            const enemy = entity.get(EnemyComponent);
            if (enemy) {
                enemy.blood = Math.max(enemy.blood - harm.damage, 0);
                if (enemy.blood <= 0) {
                    entity.add(DestroyComponent);
                }
            }
            harm.destroy();
        })
    }
}

