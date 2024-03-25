import { view } from 'cc';
import { EcsSystem, IFilter, NodeComponent, filter } from 'db://pkg/@gamex/cc-ecs';
import { IQuadRect } from 'db://pkg/@gamex/cc-quadtree';
import { app } from '../../../../../../../../app/app';
import { BulletComponent } from '../component/BulletComponent';
import { CollideComponent } from '../component/CollideComponent';
import { DamageComponent } from '../component/DamageComponent';
import { DestroyComponent } from '../component/DestroyComponent';
import { EnemyComponent } from '../component/EnemyComponent';
import { HarmComponent } from '../component/HarmComponent';
import { PlayerComponent } from '../component/PlayerComponent';
import { PropComponent } from '../component/PropComponent';
import { MyEntity } from '../entity/MyEntity';
import { DataSingleton } from '../singleton/DataSingleton';

export class CollideSystem extends EcsSystem {
    private enemyFilter = filter.all(EnemyComponent, CollideComponent, NodeComponent).exclude(DestroyComponent);
    private playerFilter = filter.all(PlayerComponent, CollideComponent, NodeComponent).exclude(DestroyComponent);
    private bulletFilter = filter.all(BulletComponent, CollideComponent, NodeComponent).exclude(DestroyComponent);
    private propFilter = filter.all(PropComponent, CollideComponent, NodeComponent).exclude(DestroyComponent);

    protected filter: IFilter = this.bulletFilter;
    protected openWatchEntities: boolean = true;
    protected onEntityEnter(entities: MyEntity[]): void {
        const data = this.ecs.getSingleton(DataSingleton);
        entities.forEach(entity => {
            const node = entity.get(NodeComponent);
            entity.rid = data.quadTree.insert(node.position, node.contentSize, node);
        })
    }

    private check(a: NodeComponent, b: NodeComponent) {
        if (a.minX > b.maxX) return false;
        if (a.maxX < b.minX) return false;
        if (a.minY > b.maxY) return false;
        if (a.maxY < b.minY) return false;
        return true;
    }

    protected execute(): void {
        const playerNode = this.find(this.playerFilter, NodeComponent);
        const enemyNodes = this.query(this.enemyFilter, NodeComponent);
        const bulletNodes = this.query(this.bulletFilter, NodeComponent);
        const winSize = view.getVisibleSize();

        // 敌人与玩家碰撞
        for (let index = 0, overFlag = false; index < enemyNodes.length; index++) {
            const enemyNode = enemyNodes[index];

            // 出界
            if (enemyNode.maxY < -winSize.height / 2) {
                enemyNode.entity.add(DestroyComponent);
            } else if (!overFlag && playerNode && this.check(playerNode, enemyNode)) {
                playerNode.entity.add(DestroyComponent);
                overFlag = true;
            }
        }

        // 更新子弹信息
        const data = this.ecs.getSingleton(DataSingleton);
        for (let index = 0; index < bulletNodes.length; index++) {
            const bulletNode = bulletNodes[index] as NodeComponent<MyEntity>;

            // 更新子弹在四叉树中的坐标
            data.quadTree.refreshPosition(bulletNode.entity.rid, bulletNode.position);

            // 出界
            if (bulletNode.maxY > winSize.height / 2) {
                bulletNode.entity.add(DestroyComponent);
            }
        }

        // 子弹与敌人碰撞
        for (let index = 0, out: IQuadRect<NodeComponent>[] = []; index < enemyNodes.length; out.length = 0, index++) {
            const enemyNode = enemyNodes[index];
            // 根据敌人位置碰撞范围检索子弹
            data.quadTree.retrieveBounds(out, enemyNode).forEach(rect => {
                const bulletEntity = rect.target.entity;
                bulletEntity.add(DestroyComponent);
                const damage = bulletEntity.getComponent(DamageComponent);
                if (damage) {
                    enemyNode.entity.add(HarmComponent).damage = damage.attack;
                    app.manager.sound.playEffect({ name: 'effect/hit', interval: 0.1 });
                }
            })
        }

        // 道具与人碰撞
        if (playerNode) {
            const propNodes = this.query(this.propFilter, NodeComponent);
            for (let index = 0; index < propNodes.length; index++) {
                const propNode = propNodes[index];

                // 出界
                if (propNode.maxY < -winSize.height / 2) {
                    propNode.entity.add(DestroyComponent);
                } else if (this.check(playerNode, propNode)) {
                    const player = playerNode.entity.getComponent(PlayerComponent);
                    const prop = propNode.entity.getComponent(PropComponent)
                    if (prop.type === PropComponent.Type.Attack) {
                        player.attack += prop.value;
                    } else if (prop.type === PropComponent.Type.Speed) {
                        player.speed += prop.value;
                    } else if (prop.type === PropComponent.Type.Split) {
                        player.split += prop.value;
                    }
                    propNode.entity.add(DestroyComponent);
                    app.manager.sound.playEffect({ name: 'effect/eat' });
                }
            }
        }
    }
}

