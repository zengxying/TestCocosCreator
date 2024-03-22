import { Component, EventHandler, Vec2, Vec3, _decorator, director, lerp, misc, v2, v3 } from "cc";

const { ccclass, property, menu } = _decorator;


@ccclass("game.ParabolaMove")
@menu('game/game.ParabolaMove')
export class ParabolaMove extends Component {

    @property(Vec3)
    originPos: Vec3;

    @property(Vec3)
    targetPos: Vec3;

    @property()
    speed: number;

    @property()
    topHeightMul: number;

    @property()
    facingTangent: boolean;



    _totalTime: number;
    _moveTime: number;
    _tempVec3: Vec3;


    /**
     * 初始化函数
     *
     * @param originPos 起始位置
     * @param targetPos 目标位置
     * @param speed 速度
     * @param topHeightMul 顶部高度乘数
     * @param facingTangent 是否面向切线方向
     */
    init(originPos: Vec3, targetPos: Vec3, speed: number, topHeightMul: number, facingTangent?: boolean) {
        this.originPos = originPos;
        this.targetPos = targetPos;
        this.speed = speed;
        this.topHeightMul = topHeightMul;

        const distance = Vec3.distance(this.originPos, this.targetPos);
        this._totalTime = distance / speed;
        this._moveTime = 0;
        this._tempVec3 = new Vec3();
        this.facingTangent = facingTangent;
        Vec3.subtract(this._tempVec3, this.targetPos, this.originPos);


        this.topHeightMul = (this.topHeightMul * Math.abs(this._tempVec3.y)) + this.originPos.y; 

    }

    update(dt: number) {
        // 假设 startPoint, endPoint, speed, maxHeight 是已知的 Vec3 对象
        let startPoint = this.originPos;
        let endPoint = this.targetPos;
        let maxHeight = this.topHeightMul; // 替换为实际最高点

        let nodePosition = this.node.position; // 记录节点当前位置
        this._tempVec3.set(nodePosition); // 记录节点当前位置到临时变量
        this._moveTime += dt; // 获取每帧时间间隔

        let t = this._moveTime / this._totalTime; // 根据时间比例计算当前位置

        let x = lerp(startPoint.x, endPoint.x, t); // 线性插值计算 x
        let y = 0; // 初始化 y
        if (t < 0.5) {
            y = lerp(startPoint.y, maxHeight, t * 2); // 前半段插值到最高点
        } else {
            y = lerp(maxHeight, endPoint.y, (t - 0.5) * 2); // 后半段插值回到终点
        }
        let z = lerp(startPoint.z, endPoint.z, t); // 线性插值计算 z

        nodePosition.set(x, y, z); // 设置节点的位置
        this.node.position = nodePosition;

        if (this.facingTangent) {
            Vec3.subtract(this._tempVec3, nodePosition, this._tempVec3);
            this.node.forward = this._tempVec3;
        }
    }


}