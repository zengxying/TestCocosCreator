import { CCString, Component, _decorator } from "cc";
import { SCMLAnimation } from "../../tool/SCMLAnimation";
import { Handler } from "../../tool/Handler";
import { EntityComp } from "../interface/EntityComp";
import { Entity } from "../interface/Entity";
const { ccclass, property, menu } = _decorator;


@ccclass("game.Enemy")
@menu('game/game.Enemy')
export class Enemy extends Component implements EntityComp{

    @property({type:CCString, tooltip:"scml动画路径"})
    aniPath:string;
    @property({type:CCString, tooltip:"scml动画路径对应的bundle包名"})
    bundlePath:string = "resources";
    
    entity:Entity;
    ani:SCMLAnimation;

    protected onLoad(): void {
        this.ani = new SCMLAnimation(this.aniPath, "", this.node, this.bundlePath);
    }

    initEntity(entity:Entity){
        this.entity = entity;
        
    }

    protected update(dt: number): void {
        this.ani && this.ani.update(dt);
    }

    public regsterFrameEvent(aniName: string, frameLv: number, handler: Handler){
        this.ani.regsterFrameEvent(aniName, frameLv, handler);
    }

    public removeFrameEvent(aniName: string, frameLv: number, handler: Handler){
        this.ani.removeFrameEvent(aniName, frameLv);
    }

    public playerAni(aniName: string, playCount?: number, scale?: number, lv?: number){
        this.ani && this.ani.playAni(aniName, playCount, scale, lv);
    }

    public move(dt:number){

    }

    public atk(){

    }

    public skill(){

    }

    public hurt(){
        
    }
}