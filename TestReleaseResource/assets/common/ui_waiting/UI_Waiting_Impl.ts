import { tgxUIWaiting, tgxLayout_UIWaiting, tgxModuleContext } from "../../scripts/core_tgx/tgx";
import { GameUILayers } from "../../scripts/src/GameUILayers";



export class UIWaiting_Impl extends tgxUIWaiting{
    constructor(){
        super('ui_waiting/UI_Waiting',GameUILayers.LOADING, tgxLayout_UIWaiting);
    }
}

tgxModuleContext.attachImplClass(tgxUIWaiting, UIWaiting_Impl);