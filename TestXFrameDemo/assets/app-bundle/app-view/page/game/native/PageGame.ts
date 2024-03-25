import { EventTouch, Node, Prefab, UITransform, _decorator, instantiate, v3, view } from 'cc';
import { MoveComponent, NodeComponent, ecs } from 'db://pkg/@gamex/cc-ecs';
import BaseView from '../../../../../../extensions/app/assets/base/BaseView';
import { IMiniViewNames } from '../../../../../app-builtin/app-admin/executor';
import { GameControl } from '../../../../../app-builtin/app-control/GameControl';
import { app } from '../../../../../app/app';
import { BulletComponent } from './expansion/ecs/component/BulletComponent';
import { CollideComponent } from './expansion/ecs/component/CollideComponent';
import { DamageComponent } from './expansion/ecs/component/DamageComponent';
import { EnemyComponent } from './expansion/ecs/component/EnemyComponent';
import { PlayerComponent } from './expansion/ecs/component/PlayerComponent';
import { PropComponent } from './expansion/ecs/component/PropComponent';
import { MyEntity } from './expansion/ecs/entity/MyEntity';
import { DataSingleton } from './expansion/ecs/singleton/DataSingleton';
import { InputSingleton } from './expansion/ecs/singleton/InputSingleton';
import { CollideSystem } from './expansion/ecs/system/CollideSystem';
import { DestroySystem } from './expansion/ecs/system/DestroySystem';
import { EnemySystem } from './expansion/ecs/system/EnemySystem';
import { HarmSystem } from './expansion/ecs/system/HarmSystem';
import { InputSystem } from './expansion/ecs/system/InputSystem';
import { ShootSystem } from './expansion/ecs/system/ShootSystem';

const { ccclass, property } = _decorator;
@ccclass('PageGame')
export class PageGame extends BaseView.BindControl(GameControl) {
    // 子界面
    protected miniViews: IMiniViewNames = ['PaperGameIndex'];

    @property(Prefab)
    private player: Prefab = null;

    @property(Prefab)
    private bullet: Prefab = null;

    @property(Prefab)
    private enemy: Prefab = null;

    @property(Prefab)
    private prop: Prefab = null;

    private bulletCache: Node[] = [];
    private enemyCache: Node[] = [];
    private propCache: Node[] = [];
    private slow = 1;

    // 初始化的相关逻辑写在这
    onLoad() {
        ecs.addSystem(InputSystem);
        ecs.addSystem(EnemySystem);
        ecs.addSystem(ShootSystem);
        ecs.addSystem(CollideSystem);
        ecs.addSystem(HarmSystem);
        ecs.addSystem(DestroySystem);

        ecs.addSingleton(DataSingleton);

        this.control.on(GameControl.Event.Shoot, this.onShoot, this);
        this.control.on(GameControl.Event.Enemy, this.onEnemy, this);
        this.control.on(GameControl.Event.Prop, this.onProp, this);

        this.control.on(GameControl.Event.CollectBullet, this.onCollectBullet, this);
        this.control.on(GameControl.Event.CollectEnemy, this.onCollectEnemy, this);
        this.control.on(GameControl.Event.CollectProp, this.onCollectProp, this);

        this.initCache();
        this.initPlayer();
    }

    // 界面打开时的相关逻辑写在这(onShow可被多次调用-它与onHide不成对)
    onShow(params: any) {
        app.manager.sound.playMusic({ name: 'music/war' });
        this.showMiniViews({
            views: this.miniViews
        })
    }

    // 界面关闭时的相关逻辑写在这(已经关闭的界面不会触发onHide)
    onHide(result: undefined) {
        ecs.clearAll();
        this.control.targetOff(this);
        // app.manager.ui.show<PageGame>({name: 'PageGame', onHide:(result) => { 接收到return的数据，并且有类型提示 }})
        return result;
    }

    update(dt: number) {
        if (ecs.getSingleton(DataSingleton).over === true) {
            this.slow += 0.1;
            ecs.execute(dt / this.slow);
        } else {
            ecs.execute(dt);
            if (ecs.getSingleton(DataSingleton).over === true) {
                app.manager.sound.playMusic({ name: 'music/over' });
                this.scheduleOnce(() => {
                    app.manager.ui.show({
                        name: 'PopOver'
                    })
                }, 0.3)
            }
        }
    }

    private initCache() {
        for (let index = 0; index < 50; index++) {
            const node = instantiate(this.bullet);
            this.onCollectBullet(node);
        }
        for (let index = 0; index < 12; index++) {
            const node = instantiate(this.enemy);
            this.onCollectEnemy(node);
        }
        for (let index = 0; index < 12; index++) {
            const node = instantiate(this.prop);
            this.onCollectProp(node);
        }
    }

    private initPlayer() {
        const player = instantiate(this.player);
        player.parent = this.node;

        const entity = ecs.createEntity(MyEntity, { node: player });
        entity.add(PlayerComponent);
        entity.add(CollideComponent);
        const node = entity.add(NodeComponent);
        node.setContentSize(player.getComponent(UITransform).width, player.getComponent(UITransform).height);

        const uit = this.node.getComponent(UITransform);
        const input = ecs.addSingleton(InputSingleton);
        player.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
            const pos = event.getUILocation();
            const { x, y } = uit.convertToNodeSpaceAR(v3(pos.x, pos.y, 1));
            input.x = x;
            input.y = y;
        }, this);
    }

    private onCollectBullet(node: Node) {
        // node.parent = null;
        node.setPosition(10000, 0, 0);
        this.bulletCache.push(node);
    }

    private onCollectEnemy(node: Node) {
        // node.parent = null;
        node.setPosition(10000, 0, 0);
        this.enemyCache.push(node);
    }

    private onCollectProp(node: Node) {
        // node.parent = null;
        node.setPosition(10000, 0, 0);
        this.propCache.push(node);
    }

    private onShoot(playerNode: NodeComponent, player: PlayerComponent) {
        const count = player.split + 1;
        const center = (count * 5 + 5) / 10;

        for (let index = 1; index <= count; index++) {
            const bullet = this.bulletCache.pop() || instantiate(this.bullet);
            if (!bullet.parent) bullet.parent = this.node;
            bullet.x = playerNode.x;
            bullet.y = playerNode.y;

            const entity = ecs.createEntity(MyEntity, { node: bullet });
            entity.add(CollideComponent);

            const damage = entity.add(DamageComponent);
            damage.attack = player.attack;

            const node = entity.add(NodeComponent);
            node.setPosition(playerNode.x, playerNode.y);
            node.setContentSize(bullet.getComponent(UITransform).width, bullet.getComponent(UITransform).height);

            const move = entity.add(MoveComponent);
            move.openRotate = true;
            move.toward = (index - center) * 10 + 90;
            move.speed = 1000;

            // 子弹组件
            entity.add(BulletComponent);
        }

        app.manager.sound.playEffect({ name: 'effect/shoot', volume: 0.6 });
    }

    private onProp(playerNode: NodeComponent) {
        const prop = this.propCache.pop() || instantiate(this.prop);
        if (!prop.parent) prop.parent = this.node;
        prop.x = playerNode.x;
        prop.y = playerNode.y;

        const entity = ecs.createEntity(MyEntity, { node: prop });
        entity.add(CollideComponent);

        const move = entity.add(MoveComponent);
        move.toward = -90;
        move.speed = 300;

        const node = entity.add(NodeComponent);
        node.setPosition(playerNode.x, playerNode.y);
        node.setContentSize(prop.getComponent(UITransform).width, prop.getComponent(UITransform).height);

        // 道具组件
        const com = entity.add(PropComponent);
        if (Math.random() < 0.3) {
            com.value = 1;
            com.type = PropComponent.Type.Speed;
        } else if (Math.random() < 0.3) {
            com.value = 1;
            com.type = PropComponent.Type.Attack;
        } else {
            com.value = 1;
            com.type = PropComponent.Type.Split;
        }
    }

    private onEnemy() {
        for (let index = -1; index <= 1; index++) {

            const enemy = this.enemyCache.pop() || instantiate(this.enemy);
            if (!enemy.parent) enemy.parent = this.node;
            enemy.x = index * 250;
            enemy.y = view.getVisibleSize().height / 2 + enemy.getComponent(UITransform).height / 2;

            const entity = ecs.createEntity(MyEntity, { node: enemy });
            entity.add(CollideComponent);

            const node = entity.add(NodeComponent);
            node.setPosition(enemy.x, enemy.y);
            node.setContentSize(enemy.getComponent(UITransform).width, enemy.getComponent(UITransform).height);

            const move = entity.add(MoveComponent)
            move.toward = -90;
            move.speed = 200;

            // 敌人组件
            entity.add(EnemyComponent).blood = (index + 1) * (index + 1) * 100 + 3;
        }
    }
}