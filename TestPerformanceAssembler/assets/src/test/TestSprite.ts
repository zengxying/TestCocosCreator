import { CCFloat, CCInteger, Sprite, SpriteFrame } from "cc";
import { _decorator, Component } from "cc";
import { simpleTest } from "./simple";
import { DEBUG, EDITOR } from "cc/env";
import { surfaceAssembler } from "./SurfaceAssembler";
const { ccclass, property ,executeInEditMode} = _decorator;
@ccclass("TestSprite")
@executeInEditMode(true)
export class TestSprite extends Sprite{


    @property(CCFloat)
    private _ellipseDepth:number = 0;
    @property(CCInteger)
    private _ellipseSegment:number = 1;
    @property({type:CCFloat, tooltip:"曲面深度"})
    set ellipseDepth(value:number) {
        this._ellipseDepth = value;
        if(this.markChangeAssembler()){
            this._resetAssembler();
        }
        this._assembler && this._assembler.resetRenderData(this);
        
    }
    get ellipseDepth():number {
        return this._ellipseDepth;
    }
    @property({type:CCInteger, tooltip:"曲面段数", min:1, max:100000})
    set ellipseSegment(value:number) {
        this._ellipseSegment = value;
        if(this.markChangeAssembler()){
            this._resetAssembler();
        }
        
        this._assembler && this._assembler.resetRenderData(this);
    }
    get ellipseSegment():number {
        return this._ellipseSegment;
    }

    @property({type:CCFloat, tooltip:"曲面速度"})
    ellipseSpeed:number = 1;
    @property({type:CCFloat, tooltip:"曲面宽度"})
    ellipseWidth:number = 100;

    private _isElipse:boolean = false;

    public startUVX:number = 0;
    
    

    markChangeAssembler(){
        if(this.ellipseSegment > 1 && this._ellipseDepth !== 0 && this._isElipse){
            return false;
        }
        this._isElipse = this.ellipseSegment > 1 && this._ellipseDepth > 0;
        console.log("markChangeAssembler", this._isElipse);
        return true;
    }


    protected update(dt: number): void {

        this.startUVX += (dt * this.ellipseSpeed);
        this.startUVX %= 1;
        this.startUVX /= 1;
        if(this._assembler){
            this._assembler.updateUVs(this);
        }
    }

    protected _resetAssembler(): void {
        this._assembler = null;
        this._renderData = null;
        console.log("重置assembler");
        this._flushAssembler();
    }


    protected _flushAssembler(): void {
        const assembler = surfaceAssembler;

        if (this._assembler !== assembler) {
            this.destroyRenderData();
            this._assembler = assembler;
        }

        if (!this._renderData) {
            if (this._assembler && this._assembler.createData) {
                this._renderData = this._assembler.createData(this);
                this._renderData!.material = this.getRenderMaterial(0);
                this.markForUpdateRenderData();
                if (this.spriteFrame) {
                    this._assembler.updateUVs(this);
                }
                this._updateColor();
            }
        }

        // Only Sliced type need update uv when sprite frame insets changed
        if (this._spriteFrame) {
            if (this._type === 1) {
                //@ts-ignore
                this._spriteFrame.on(SpriteFrame.EVENT_UV_UPDATED, this._updateUVs, this);
            } else {
                //@ts-ignore
                this._spriteFrame.off(SpriteFrame.EVENT_UV_UPDATED, this._updateUVs, this);
            }
        }
    }
}