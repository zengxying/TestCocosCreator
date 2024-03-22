import { _decorator, Component, Prefab, director, Node, AssetManager, JsonAsset, SpriteFrame, Asset, Animation, game } from "cc";
import { ResourceMgr } from "../../core_tgx/base/ResourceMgr";
import { AutoEventHandler } from "../../core_tgx/easy_ui_framework/UIController";
import { UIMgr } from "../../core_tgx/easy_ui_framework/UIMgr";
import { Log } from "../../core_tgx/tool/Log";
import { child } from "../Decorator";
import { GameUILayers, GameUILayerNames } from "../GameUILayers";
import { ModuleDef } from "../ModuleDef";
import { createClip } from "../../core_tgx/tool/DynamicFrameAniamtion";
import { SceneDef } from "../SceneDef";


const { ccclass, property, menu } = _decorator;


@ccclass("game.AniScene")
@menu('game/game.AniScene')
export class AniScene extends Component {

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

    private _aniClipsRes:any[];
    
    start(): void {
        ResourceMgr.inst.loadBundle("ani", (bundle: AssetManager.Bundle)=>{
            Log.log("ani  bundle 加载成功");
            console.time("load dir res/hit");
            bundle.loadDir("res/hit", (err:any, data:SpriteFrame[])=>{
                Log.log("load dir res/hit --- > " , data, err);
                console.timeEnd("load dir res/hit");
                const sps = data.filter((value)=> value instanceof SpriteFrame).sort((a,b)=> parseInt(a.name.split("_")[1]) -  parseInt(b.name.split("_")[1]));
                const aniName = "hit";
                const ani = createClip(sps, this.hitAniNode, aniName, 1);
                ani.play(aniName);
                data.forEach(item=> item.addRef());
                this._aniClipsRes = data;

            })
        })
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
            const ani = this.hitAniNode.getComponent(Animation);
            if(ani){
                ani.removeClip(ani.clips[0], true);
            }
            const data:Asset[] = this._aniClipsRes;
            data.forEach(item=> item.decRef());
            director.runScene(res);
        })
    }


    

    onInterstitialBeforeAd() {
        console.log('H5GA Interstitial Before Ad');
    }

    onInterstitialAfterAd() {
        console.log('H5GA Interstitial After Ad');
    }

    onInterstitialAdBreakDone() {
        console.log('H5GA Interstitial Ad Break Done');
    }

    onRewardedVideoBeforeAd() {
        console.log('H5GA Rewarded Video Before Ad');
    }

    onRewardedVideoAfterAd() {
        console.log('H5GA Rewarded Video After Ad');
    }

    onRewardedVideoAdBreakDone() {
        console.log('H5GA Rewarded Video Ad Break Done');
    }

    onRewardedVideoBeforeReward() {
        console.log('H5GA Rewarded Video Before Reward');
    }

    onRewardedVideoAdViewed() {
        console.log('H5GA Rewarded Video Ad Viewed');
    }

    onRewardedVideoAdDismissed() {
        console.log('H5GA Rewarded Video Ad Dismissed');
    }


}