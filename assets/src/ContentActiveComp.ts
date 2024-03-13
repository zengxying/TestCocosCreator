import { _decorator, Component, Node } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('ContentActiveComp')
@executeInEditMode(true)
export class ContentActiveComp extends Component {

    @property({
        type: Node,
    })
    target:Node = null;

    protected onLoad(): void {
        // return
        if (!this.target) {
            this.target = this.node;
        }
        var parent = this.target;
        var content:Node = null;
        while (parent.children.length > 0) {
            content = parent.getChildByName("Content");
            if (!content) {
                parent = parent.children[0];
            } else {
                break;
            }
        }
        if(this.target !== this.node){
            content = this.target;
        }
        if (content) {
            console.log("操作的一批节点：", this.node.name);
            content.children.forEach((child,idx) => child.active = idx == 0);
        }
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


