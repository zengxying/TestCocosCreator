import { Enum, Event, EventTouch, IAssembler, Mat4, Node, RenderComponent, Texture2D, UITransform, Vec2, _decorator, gfx, macro, v2 } from "cc";
import { TextureAssembler } from "./TextureAssembler";
import { CommonUtils } from "./CommonUtils";



enum TextureType {
    Cut,            // 裁剪
    Stretch         // 拉伸, 暂未实现
}

let _vec2_temp = new Vec2();
let _mat4_temp = new Mat4();

const {ccclass, menu, executeInEditMode,  property} = _decorator;

@ccclass
@executeInEditMode
@menu('i18n:MAIN_MENU.component.ui/TexturePlus')
// @mixins(BlendFunc)
export default class TexturePlus extends RenderComponent {
    static Type = TextureType;
    
    @property(Texture2D)
    _texture: Texture2D = null;
    @property(Texture2D)
    get texture() {
        return this._texture;
    }
    set texture(val: Texture2D) {
        this._texture = val;
        let l = -val.width/2, b = -val.height/2, t = val.height/2, r = val.width/2;
        this.polygon = [v2(l, b), v2(r, b), v2(r, t), v2(l, t)];
        this.node.getComponent(UITransform).contentSize.set(val.width, val.height);
        
        this._updateMaterial();
    }

    // _type: TextureType = 0;
    // @property({type: Enum(TextureType), serializable: true})
    // get type() {
    //     return this._type;
    // }
    // set type(val: TextureType) {
    //     this._type = val;
    //     this.setVertsDirty();
    // }

    @property({type: [Vec2], serializable: true})
    _polygon: Vec2[] = [];
    @property({type: [Vec2], serializable: true})
    public get polygon() {
        return this._polygon;
    }
    public set polygon(points: Vec2[]) {
        this._polygon = points;
        this._updateVerts();
    }

    @property({type: Enum(gfx.BlendFactor), override: true})
    srcBlendFactor: gfx.BlendFactor = gfx.BlendFactor.SRC_ALPHA;

    @property({type: Enum(gfx.BlendFactor), override: true})
    dstBlendFactor: gfx.BlendFactor = gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;

    @property(Boolean)
    editing: boolean = false;
    
    _assembler: IAssembler = null;
    _vertsDirty: boolean = false;

    onLoad() {
        this.node['_hitTest'] = this._hitTest.bind(this);
    }

    start() {
        this.node.on(Node.EventType.TOUCH_START, () => {
            console.log("click texture plus");
        }, this);
        this.node.on(Node.EventType.TOUCH_MOVE, (e: EventTouch) => {
            var x = this.node.position.x + e.getDeltaX();
            var y = this.node.position.y + e.getDeltaY();
            this.node.setPosition(x,y);
        }, this);
    }


    private _updateVerts() {
        this.setVertsDirty();
    }

    setVertsDirty(){
        this._vertsDirty = true;
    }

    public _updateMaterial() {
        let texture = this._texture;
        let material = this.getMaterial(0);
        if(material) {

            material.setProperty("texture", texture);
        }
        this['__proto__']._updateBlendFunc.call(this);
        this.setVertsDirty();        
    }

    public _validateRender() {
        
    }

    public _resetAssembler() {
        let assembler = this._assembler = TextureAssembler;
        assembler.init(this);
        this._updateColor();
        this.setVertsDirty();
    }

    _hitTest (cameraPt: Vec2) {
        let node = this.node;
        let size = node.getComponent(UITransform).contentSize,
            w = size.width,
            h = size.height,
            testPt = _vec2_temp;
        
        node['_updateWorldMatrix']();
        // If scale is 0, it can't be hit.
        if (!Mat4.invert(_mat4_temp, node['_worldMatrix'])) {
            return false;
        }
        Vec2.transformMat4(testPt, cameraPt, _mat4_temp);
        return CommonUtils.isInPolygon(testPt, this.polygon);
    }
}