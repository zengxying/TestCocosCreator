import { CCBoolean, CCFloat, CCInteger, Sprite ,SpriteFrame,_decorator} from "cc";
import { roundboxAssemble } from "./RoundBoxAssembler";
import { RoundBoxAssemblerSuper } from "./RoundBoxAssemblerSuper";
const { ccclass, property } = _decorator;

@ccclass("RoundBox")
export class RoundBox extends Sprite{

    @property({})
    _leftTop:boolean = false;
    @property({tooltip:"圆角的方向 left right top bottom"})
    set leftTop(value:boolean){
        this._leftTop = value;
        this._updateVertexInfo();
    }
    get leftTop():boolean{
        return this._leftTop;
    }
    
    @property({})
    _leftBottom:boolean = false;
    @property({tooltip:"圆角的方向 left right top bottom"})
    set leftBottom(value:boolean){
        this._leftBottom = value;
        this._updateVertexInfo();
    }
    get leftBottom():boolean{
        return this._leftBottom;
    }
    
    @property({})
    _rightTop:boolean = false;
    @property({tooltip:"圆角的方向 left right top bottom"})
    set rightTop(value:boolean){
        this._rightTop = value;
        this._updateVertexInfo();
    }
    get rightTop():boolean{
        return this._rightTop;
    }
    @property({})
    _rightBottom:boolean = false;
    @property({tooltip:"圆角的方向 left right top bottom"})
    set rightBottom(value:boolean){
        this._rightBottom = value;
        this._updateVertexInfo();
    }
    get rightBottom():boolean{
        return this._rightBottom;
    }

    @property({type:CCInteger})
    _segments:number = 0;
    @property({type:CCInteger})
    set segments(value:number){
        this._segments = value;
        this._updateVertexInfo();
    }
    get segments():number{
        return this._segments;
    }
    @property({type:CCFloat})
    _radius:number = 0;
    @property({type:CCFloat})
    set radius(value:number){
        this._radius = value;
        this._updateVertexInfo();
    }
    get radius():number{
        return this._radius;
    }


    private _updateVertexInfo(){
        // if(this._assembler){
        //     this._assembler.updateUVs(this);
        //     this._assembler.updateVertexData(this)
        // }
    }

    protected _flushAssembler(): void {
        const assembler = RoundBoxAssemblerSuper;

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