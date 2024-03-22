import { _decorator, BatchingUtility, CCBoolean, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StaticBatch')
export class StaticBatch extends Component {

    @property(Node)
    mergeNode: Node = null;
    @property(Node)
    toNode:Node = null;

    @property(CCBoolean)
    isBatch:boolean = false;
    
    onEnable() {
        this.mergeNode ||= this.node;
        this.toNode ||= this.node;
        //@ts-ignore
        window.testBatchingFunc = ()=>{
            BatchingUtility.batchStaticModel(this.mergeNode, this.toNode);
        }
        if(this.isBatch){
            //@ts-ignore
            window.testBatchingFunc();
        }
        // this.node.active = false;
    }

    update(deltaTime: number) {
        
    }
}


