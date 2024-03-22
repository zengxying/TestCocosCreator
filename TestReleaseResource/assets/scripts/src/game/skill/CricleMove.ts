import { Component, Mat4, Node, Vec2, Vec3, _decorator, misc, v2, v3 } from "cc";

const { ccclass, property, menu } = _decorator;


@ccclass("game.CricleMove")
@menu('game/game.CricleMove')
export class CricleMove extends Component {

    @property(Node)
    target: Node;

    @property(Vec3)
    axis: Vec3;

    @property()
    radius: number;

    @property()
    speed: number;

    @property()
    lookAtTarget: boolean = false;

    private _direction: Vec3

    /**
     * 初始化函数
     *
     * @param target 目标节点
     * @param axis 轴向
     * @param radius 半径
     * @param speed 速度
     * @param lookAtTarget 是否朝向目标
     */
    init(target:Node, axis:Vec3, radius:number, speed:number, lookAtTarget:boolean) {
        this.target = target;
        this.axis = axis;
        this.radius = radius;
        this.speed = speed;
        this.lookAtTarget = lookAtTarget;
        this._direction = new Vec3();
    }
    
    /**
     * 更新函数
     *
     * @param dt 时间差
     * @returns 无返回值
     */
    protected update(dt: number): void {
        if (!this.target || !this.node) {
            console.error("Target or Node is not defined.");
            return;
        }
    
        let targetPosition = this.target.position;
        let nodePosition = this.node.position;
        
        // Calculate the direction vector from the target to the node
        Vec3.subtract(this._direction, targetPosition, nodePosition);
        Vec3.normalize(this._direction, this._direction);
        this._direction.multiplyScalar(this.radius);
    
        let angleInDegrees = dt * this.speed; // angle
        let angleInRadians = misc.degreesToRadians(angleInDegrees);
        
        // Ensure the axis is normalized
        if (this.axis) {
            this.axis.normalize();
        } else {
            console.error("Axis is not defined.");
            return;
        }
    
        // Create a rotation matrix
        let rotationMatrix = new Mat4();
        rotationMatrix.rotate(angleInRadians, this.axis);
    
        // Apply the rotation to the direction vector
        this._direction.transformMat4(rotationMatrix);
    
        // Update the node's position based on the rotated direction vector
        this.node.position = this._direction.add(nodePosition);

        if(this.lookAtTarget){
            this.node.lookAt(targetPosition);
        }
    }
}