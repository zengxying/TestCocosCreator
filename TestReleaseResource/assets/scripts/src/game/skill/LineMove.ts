import { Component, Vec2, Vec3, _decorator, v2, v3 } from "cc";

const { ccclass, property, menu } = _decorator;


@ccclass("game.LineMove")
@menu('game/game.LineMove')
export class LineMove extends Component{

    @property(Vec3)
    dir:Vec3;

    @property()
    speed:number;

    @property()
    addtion:number;

    curSpeed:Vec3 = v3();

    /**
     * 初始化函数
     *
     * @param dir - 方向向量
     * @param speed - 速度
     */
    init(dir:Vec3, speed:number){
        this.dir = dir;
        this.speed = speed;
    }

    /**
     * 更新节点位置
     *
     * @param dt 时间差
     * @returns 无返回值
     */
    protected update(dt: number): void {
        Vec3.multiplyScalar(this.curSpeed, this.dir, dt * this.speed);
        if(this.addtion){
            this.speed += this.speed * this.addtion;
        }
        this.node.position = this.node.position.add(this.curSpeed);
    }
}