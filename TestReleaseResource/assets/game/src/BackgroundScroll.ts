import { Component, Node, Sprite, UITransform, _decorator, ccenum, v3 } from "cc";
import { Log } from "../../scripts/core_tgx/tool/Log";


const { ccclass, property, menu } = _decorator;
const tempv3 = v3();
const trans_key = "$trans_obj";
enum DirType {
    UP,
    DOWN,
    LEFT,
    RIGHT
}
ccenum(DirType);

@ccclass("game.BackgroundScroll")
@menu('game/game.BackgroundScroll')
export class BackgroundScroll extends Component {

    @property({
        type: [Node]
    })
    backgroundBgs: Node[] = [];

    @property({ type: DirType })
    dirType: DirType = DirType.RIGHT;

    @property(Node)
    displayWindow: Node;

    @property
    speed: number = 100;

    /** 总的移动量 */
    private _moveTotal: number = 0;
    private _limitAxisDistance: number = 0;


    protected start(): void {
        this.displayWindow ||= this.node;
        const node = this.displayWindow;
        const uitrans = node.getComponent(UITransform);
        var posKey = "y";
        switch (this.dirType) {
            case DirType.DOWN:
                this._limitAxisDistance = - uitrans.height / 2;
                break;
            case DirType.UP:
                this._limitAxisDistance = uitrans.height / 2;
                break;
            case DirType.LEFT:
                posKey = "x";
                this._limitAxisDistance = - uitrans.width / 2;
                break;
            case DirType.RIGHT:
                posKey = "x";
                this._limitAxisDistance = uitrans.width / 2;
                break;
            default:
                break;
        }
        this.backgroundBgs.sort((a, b) => (a.position[posKey] - b.position[posKey]) * this._limitAxisDistance > 0 ?1:-1);
        var dis = 0;
        const bgtrans = this.backgroundBgs[0].getComponent(UITransform);
        var posValue = this._limitAxisDistance + bgtrans[posKey=="x"?"width":"height"] / 2;
        this.backgroundBgs.forEach(item=>{
            item.position[posKey] = posValue;
            item.setPosition(item.position);
        })
        this._moveTotal = 0;
    }

    protected update(dt: number): void {
        var moveDis = this.speed * dt;
        var key: string;
        var scale: number = 1;
        var transKey: string = "height";
        switch (this.dirType) {
            case DirType.DOWN:
                key = "y";
                scale = -1;
                break;
            case DirType.UP:
                key = "y"
                break;
            case DirType.LEFT:
                key = "x"
                scale = -1;
                transKey = "width";
                break;
            case DirType.RIGHT:
                key = "x"
                transKey = "width";
                break;
            default:
                break;
        }
        moveDis *= scale;
        this._moveTotal += moveDis;
        tempv3[key] = moveDis;
        this.backgroundBgs.forEach((item, index) => {
            const pos = item.position;
            pos.add(tempv3);
            item.setPosition(pos);
            if (!item[trans_key]) {
                item[trans_key] = item.getComponent(UITransform);
            }
            const trans = item[trans_key];
            if (Math.abs(pos[key] + (-scale * trans[transKey] / 2)) > Math.abs(this._limitAxisDistance)) {
                // 超过了极限位置
                var add = (index + 1) >= this.backgroundBgs.length ? moveDis:0;
                let lastBg = this.backgroundBgs[(index + 1) % this.backgroundBgs.length];
                if (!lastBg[trans_key]) {
                    lastBg[trans_key] = lastBg.getComponent(UITransform);
                }
                let transLast: UITransform = lastBg[trans_key];
                let curPosX = add + lastBg.position[key] + (-scale) * transLast[transKey] / 2 + (-scale)*trans[transKey] / 2;
                pos[key] = curPosX;
                item.setPosition(pos);
            }
        });
    }



    public getMoveTotal() {
        return this._moveTotal;
    }

}