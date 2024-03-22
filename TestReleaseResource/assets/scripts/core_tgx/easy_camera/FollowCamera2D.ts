import { _decorator, Component, Node, Vec3, v3, Camera } from 'cc';
const { ccclass, property, menu } = _decorator;


const tmpV3 = v3();
const tmp01V3 = v3();

@ccclass('tgxFollowCamera2D')

export class FollowCamera2D extends Component {
    @property(Node)
    target:Node;

    @property
    offset:Vec3 = v3();

    @property()
    public damp = 0.2;

    protected _camera:Camera;

    start() {
        this._camera = this.node.getComponent(Camera);
    }

    lateUpdate(deltaTime: number) {
        if(this.target){
            this.target.getWorldPosition(tmpV3);
            tmpV3.add(this.offset);
            if(this.damp > 0){
                const t = Math.min(deltaTime / this.damp, 1);
                this.node.getWorldPosition(tmp01V3);
                Vec3.lerp(tmpV3, tmp01V3, tmpV3, t);
            }
            this.node.worldPosition = tmpV3;   
        }
    }
}


