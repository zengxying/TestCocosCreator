import { Node } from 'cc';
import BaseControl from '../../../extensions/app/assets/base/BaseControl';
import { NodeComponent } from '../../app-bundle/app-view/page/game/native/expansion/ecs/common/component/NodeComponent';
import { PlayerComponent } from '../../app-bundle/app-view/page/game/native/expansion/ecs/component/PlayerComponent';
// 事件名(首字母大写),可以通过 GameControl.Event 调用
enum Event {
    Shoot,
    Enemy,
    Prop,
    CollectBullet,
    CollectEnemy,
    CollectProp,

}
export class GameControl extends BaseControl<GameControl, typeof Event>(Event) {
    shoot(node: NodeComponent, player: PlayerComponent) {
        this.emit(Event.Shoot, node, player);
    }

    enemy() {
        this.emit(Event.Enemy);
    }

    prop(node: NodeComponent) {
        this.emit(Event.Prop, node);
    }

    collectBullet(node: Node) {
        this.emit(Event.CollectBullet, node);
    }

    collectEnemy(node: Node) {
        this.emit(Event.CollectEnemy, node);
    }

    collectProp(node: Node) {
        this.emit(Event.CollectProp, node);
    }
}