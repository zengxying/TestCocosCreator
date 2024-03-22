import { _decorator, CCFloat, CCInteger, Component, Node, v2, v3, Vec2, Vec3 } from "cc";
import { MsgEvent } from "../msg/MsgEvent";
import { v3_1 } from "./GlobalConst";


const { ccclass, property } = _decorator;

@ccclass('Operator.OperatorNode')
export class OperatorNode extends Component {


    private _targetLen = 1;

    @property({type:CCFloat})
    lenMin:number = 0.1;
    @property(CCFloat)
    lenMax:number = 5.0;
    @property(CCFloat)
    zoomSensitivity:number = 0.5;

    @property(CCFloat)
    tweenTime:number = 0.2;
    @property(CCFloat)
    len: number = 1.0;

    _velocity:Vec3 = v3();
    _postion:Vec3 = v3();

    protected onLoad(): void {
        if(! isNaN(this.len)){
            this.node.setScale(this.len, this.len);
        }
        this.node.getPosition(this._postion);
    }

    protected onEnable(): void {
        this.node.on(MsgEvent.OP_TOUCH_SCALE, this._onSetScale, this);
        this.node.on(MsgEvent.OP_TOUCH_MOVE, this._onSetVelocity, this);
        this.node.on(MsgEvent.OP_TOUCH_UP, this._onTouchUp, this);
    }

    protected onDisable(): void {
        this.node.off(MsgEvent.OP_TOUCH_SCALE, this._onSetScale, this);
        this.node.off(MsgEvent.OP_TOUCH_MOVE, this._onSetVelocity, this);
        this.node.off(MsgEvent.OP_TOUCH_UP, this._onTouchUp, this);
    }

    private _onSetVelocity(_vec2: Vec2){
        this._velocity.x += -_vec2.y;
        this._velocity.y += _vec2.x;
    }

    private _onTouchUp(){

    }

    public update (deltaTime: number) {
        
        const t = Math.min(deltaTime / this.tweenTime, 1.0);
        //len and position
        this.len = this.len * (1.0 - t) + this._targetLen * t;

        this.node.setScale(this.len, this.len);
        this._postion.add(this._velocity);
        this.node.getPosition(v3_1);
        Vec3.lerp(v3_1, v3_1, this._postion, t);
        this.node.setPosition(v3_1);
        this._velocity.set();
    }

    private _onSetScale(delta: number) {
        this._targetLen += delta * this.zoomSensitivity;
        if (this._targetLen < this.lenMin) {
            this._targetLen = this.lenMin;
        }
        if (this._targetLen > this.lenMax) {
            this._targetLen = this.lenMax;
        }

    }
}