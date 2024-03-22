import { _decorator, Component, Prefab, director, Node, AssetManager, JsonAsset, SpriteFrame, Asset, Animation, resources, Sprite } from "cc";
import { ResourceMgr } from "../../core_tgx/base/ResourceMgr";
import { AutoEventHandler } from "../../core_tgx/easy_ui_framework/UIController";
import { Log } from "../../core_tgx/tool/Log";
import { child, comp } from "../Decorator";
import { ModuleDef } from "../ModuleDef";
import { SceneDef } from "../SceneDef";
import { SCMLAnimation } from "../tool/SCMLAnimation";
import { Handler } from "../tool/Handler";
import { LocalConfig } from "../../core_tgx/tool/localConfig";


const { ccclass, property, menu } = _decorator;


@ccclass("game.MainScene")
@menu('game/game.MainScene')

export class MainScene extends Component {

    @property(Prefab)
    canvasPrefab: Prefab;

    @child()
    forwardSceneBtn: Node;
    @child()
    showPage01Btn: Node;
    @child()
    showPage02Btn: Node;
    @child()
    hitAniNode: Node;

    @comp(Sprite, "aniBox")
    aniBox: Sprite;

    scmlAni01: SCMLAnimation;
    monsterConfig: any[];

    start(): void {

    }

    protected onEnable(): void {
        this.monsterConfig = LocalConfig.instance.getTableArr("MonsterName");
        AutoEventHandler.onButtonListener(this.node, this.forwardSceneBtn, this.changeScene, this);
    }



    protected update(dt: number): void {
        this.scmlAni01.update(dt);
    }

    monsterIdx = 0;
    aniIdx = 0;
    public changeAni() {
        if (this.scmlAni01) {
            this.scmlAni01.destroy();
        }
        const monsterCfg = this.monsterConfig[this.monsterIdx];
        this.aniIdx = 0;
        this.monsterIdx = (this.monsterIdx + 1) % this.monsterConfig.length;
        this.scmlAni01 = new SCMLAnimation("res/ani/" + monsterCfg.resName, "Attacking", this.aniBox.node, ModuleDef.GAME);
        // this.scmlAni01 = new SCMLAnimation("res/ani/Minotaur_01", "Attacking", this.aniBox.node, ModuleDef.GAME);
        this.scmlAni01.regsterFrameEvent("Attacking", 0.5, Handler.create(this, () => {
            console.log("执行了帧比例事件!!!!!!!!!!");
        }, null, false))
    }

    public changePlayerAni() {
        let aniNames = this.scmlAni01.pose.getAnimKeys();
        let ani = aniNames[this.aniIdx];
        this.scmlAni01.playAni(ani, 12, Math.max(Math.random(), 0.1));
        this.aniIdx = (this.aniIdx + 1) % aniNames.length;
    }


    changeScene() {

        ResourceMgr.inst.loadScene(ModuleDef.GAME, SceneDef.GAME, (err, res) => {
            if (err) {
                Log.error("加载场景失败  ani");
                return;
            }
            Log.log("加载完毕!!!!!");
            director.runScene(res);
        })
    }


}