import { _decorator, Component, Node, Sprite, spriteAssembler, SpriteFrame, UIRenderer } from 'cc';
import { elipse } from './ElipseAssebler';
const { ccclass, property } = _decorator;

@ccclass('EllipseComp')
export class EllipseComp extends Sprite {

    protected _flushAssembler () {
        const assembler = elipse;

        if (this._assembler !== assembler) {
            this.destroyRenderData();
            this._assembler = assembler;
        }

        if (!this.renderData) {
            if (this._assembler && this._assembler.createData) {
                this._renderData = this._assembler.createData(this);
                this.renderData!.material = this.getRenderMaterial(0);
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


