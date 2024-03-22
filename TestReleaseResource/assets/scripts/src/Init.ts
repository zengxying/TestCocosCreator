import { Component ,Prefab,_decorator,Node, director} from "cc";
import { UIMgr } from "../core_tgx/easy_ui_framework/UIMgr";
import { GameUILayerNames, GameUILayers } from "./GameUILayers";
import { child } from "./Decorator";
import { AutoEventHandler } from "../core_tgx/easy_ui_framework/UIController";
import { ResourceMgr } from "../core_tgx/base/ResourceMgr";
import { ModuleDef } from "./ModuleDef";
import { Log } from "../core_tgx/tool/Log";
import { SceneDef } from "./SceneDef";
import { LocalConfig } from "../core_tgx/tool/localConfig";
const { ccclass, property, menu } = _decorator;


@ccclass("game.Init")
@menu('game/game.Init')

export class Init extends Component {

    @property(Prefab)
    canvasPrefab: Prefab;

    @child()
    forwardSceneBtn:Node;
    @child()
    showPage01Btn:Node;
    @child()
    showPage02Btn:Node;

    start(): void {
        UIMgr.inst.setup(this.canvasPrefab, GameUILayers.NUM, GameUILayerNames);
        LocalConfig.instance.loadConfig(()=>{Log.log("表格数据加载成功")});
    }

    protected onEnable(): void {
        AutoEventHandler.onButtonListener(this.node, this.forwardSceneBtn, this.changeScene, this);
    }

    changeScene() {
        ResourceMgr.inst.loadScene("", SceneDef.MAIN, (err, res) => {
            if (err) {
                Log.error("加载场景失败  main");
                return;
            }
            Log.log("加载完毕!!!!!");
            // const ani = this.hitAniNode.getComponent(Animation);
            // if(ani){
            //     ani.removeClip(ani.clips[0], true);
            // }
            // const data:Asset[] = this._aniClipsRes;
            // data.forEach(item=> item.decRef());
            director.runScene(res);
        })
    }

    // changeScene() {
    //     ResourceMgr.inst.loadScene(ModuleDef.ANI, SceneDef.ANI , (err, res)=>{
    //         if(err){
    //             Log.error("加载场景失败  ani");
    //             return;
    //         }
    //         Log.log("加载完毕!!!!!");
    //         director.runScene(res);
    //     })
    // }

    
}