import { _decorator, Component, Vec2, Input, EventTouch, EventMouse, input, EventKeyboard, KeyCode, v2, misc, macro, geometry, Touch, director, Scene, Node, CCFloat } from 'cc';
import { MsgEvent } from '../msg/MsgEvent';
import { GlobalConst, v2_1 } from './GlobalConst';


const { ccclass, property ,menu} = _decorator;

@ccclass('Operator.OperateComp')
export class OperateComp extends Component {
    @property(Node)
    target: Node;
    @property(CCFloat)
    moveSensitivity: number = 1;

    // 滚轮缩放的速度
    rotaWheelSpeed: number = 0.1;


    // 手指滑动方向
    touchDir: Vec2 = new Vec2();
    private _touchA: Touch = null;
    private _touchB: Touch = null;

    private _distanceOfTwoTouchPoint: number = 0;
    

    protected onLoad(): void {
        this.target ||= this.node;
    }

    public onEnable() {

        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);


        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    public onDisable() {
        input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    private getDistOfTwoTouchPoints(): number {
        let touchA = this._touchA;
        let touchB = this._touchB;
        if (!touchA || !touchB) {
            return 0;
        }
        let dx = touchA.getLocationX() - touchB.getLocationX();
        let dy = touchB.getLocationY() - touchB.getLocationY();
        return Math.sqrt(dx * dx + dy * dy);
    }


    public onMouseWheel(e: EventMouse) {
        if (GlobalConst.interruptOp) return console.warn("中断操作中...............");
        console.log(`滚轮滚动的参数 getScrollX：${e.getScrollX()}  getScrollY:${e.getScrollY()}`)
        const delta = -e.getScrollY() * this.rotaWheelSpeed * 0.1; // delta is positive when scroll down
        this.target.emit(MsgEvent.OP_TOUCH_SCALE, delta);
    }

    public onTouchStart(e: EventTouch) {
        if (GlobalConst.interruptOp) return console.warn("中断操作中...............");
        let touches = e.getAllTouches();

        this._touchA = null;
        this._touchB = null;
        for (let i = touches.length - 1; i >= 0; i--) {
            let touch = touches[i];

            if (this._touchA == null) {
                this._touchA = touch;
            }
            else if (this._touchB == null) {
                this._touchB = touch;
                break;
            }
        }
        this._distanceOfTwoTouchPoint = this.getDistOfTwoTouchPoints();
    }



    public onTouchMove(e: EventTouch) {
        if (GlobalConst.interruptOp) return console.warn("中断操作中...............");
        let touches = e.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            let touchID = touch.getID();
            //two touches, do camera zoom.
            if (this._touchA && this._touchB) {
                console.log(touchID, this._touchA.getID(), this._touchB.getID());
                let needZoom = false;
                if (touchID == this._touchA.getID()) {
                    this._touchA = touch;
                    needZoom = true;
                }
                if (touchID == this._touchB.getID()) {
                    this._touchB = touch;
                    needZoom = true;
                }

                if (needZoom) {
                    let newDist = this.getDistOfTwoTouchPoints();
                    let delta = this._distanceOfTwoTouchPoint - newDist;
                    this.target.emit(MsgEvent.OP_TOUCH_SCALE, delta);
                    this._distanceOfTwoTouchPoint = newDist;
                }
            }
            //only one touch, do camera rotate.
            else if (this._touchA && touchID == this._touchA.getID()) {
                let dt = touch.getDelta();
                let rx = dt.y * this.moveSensitivity;
                let ry = -dt.x * this.moveSensitivity;
                v2_1.set(rx, ry);
                this.target.emit(MsgEvent.OP_TOUCH_MOVE, v2_1);
            }
        }
    }

    public onTouchEnd(e: EventTouch) {
        if (GlobalConst.interruptOp) return console.warn("中断操作中...............");
        let touches = e.getTouches();
        if (!touches || touches.length <= 0) {
            this.target.emit(MsgEvent.OP_TOUCH_UP);
        }
    }

    private keys = [];
    // x  -1 left, +1 right   y -1 backword, +1 forward

    onKeyDown(event: EventKeyboard) {
        if (GlobalConst.interruptOp) return console.warn("中断操作中...............");

        let keyCode = event.keyCode;
        if (keyCode == KeyCode.KEY_A || keyCode == KeyCode.KEY_S || keyCode == KeyCode.KEY_D || keyCode == KeyCode.KEY_W) {
            if (this.keys.indexOf(keyCode) == -1) {
                this.keys.push(keyCode);
                this.updateDirection();
            }
        }

        else if (keyCode == KeyCode.KEY_E) {
            GlobalConst.cameraMoveDir.y = 1;
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (GlobalConst.interruptOp) return console.warn("中断操作中...............");

        let keyCode = event.keyCode;
        if (keyCode == KeyCode.KEY_A || keyCode == KeyCode.KEY_S || keyCode == KeyCode.KEY_D || keyCode == KeyCode.KEY_W) {
            let index = this.keys.indexOf(keyCode);
            if (index != -1) {
                this.keys.splice(index, 1);
                this.updateDirection();
            }
        }

        if (keyCode == KeyCode.KEY_Q || keyCode == KeyCode.KEY_E) {
            GlobalConst.cameraMoveDir.y = 0;
        }
    }

   



    private key2dirMap = null;

    updateDirection() {
        if (this.key2dirMap == null) {
            this.key2dirMap = {};
            this.key2dirMap[0] = v2(0, 0);
            this.key2dirMap[KeyCode.KEY_A] = v2(-1, 0);
            this.key2dirMap[KeyCode.KEY_D] = v2(1, 0);
            this.key2dirMap[KeyCode.KEY_W] = v2(0, 1);
            this.key2dirMap[KeyCode.KEY_S] = v2(0, -1);

            this.key2dirMap[KeyCode.KEY_A * 1000 + KeyCode.KEY_W] = this.key2dirMap[KeyCode.KEY_W * 1000 + KeyCode.KEY_A] = v2(-1, 1);
            this.key2dirMap[KeyCode.KEY_D * 1000 + KeyCode.KEY_W] = this.key2dirMap[KeyCode.KEY_W * 1000 + KeyCode.KEY_D] = v2(1, 1);
            this.key2dirMap[KeyCode.KEY_A * 1000 + KeyCode.KEY_S] = this.key2dirMap[KeyCode.KEY_S * 1000 + KeyCode.KEY_A] = v2(-1, -1);
            this.key2dirMap[KeyCode.KEY_D * 1000 + KeyCode.KEY_S] = this.key2dirMap[KeyCode.KEY_S * 1000 + KeyCode.KEY_D] = v2(1, -1);

            this.key2dirMap[KeyCode.KEY_A * 1000 + KeyCode.KEY_D] = this.key2dirMap[KeyCode.KEY_D];
            this.key2dirMap[KeyCode.KEY_D * 1000 + KeyCode.KEY_A] = this.key2dirMap[KeyCode.KEY_A];
            this.key2dirMap[KeyCode.KEY_W * 1000 + KeyCode.KEY_S] = this.key2dirMap[KeyCode.KEY_S];
            this.key2dirMap[KeyCode.KEY_S * 1000 + KeyCode.KEY_W] = this.key2dirMap[KeyCode.KEY_W];
        }
        let keyCode0 = this.keys[this.keys.length - 1] || 0;
        let keyCode1 = this.keys[this.keys.length - 2] || 0;
        let dir = this.key2dirMap[keyCode1 * 1000 + keyCode0];
        GlobalConst.cameraMoveDir.x = dir.x;
        GlobalConst.cameraMoveDir.z = dir.y;
    }
}
