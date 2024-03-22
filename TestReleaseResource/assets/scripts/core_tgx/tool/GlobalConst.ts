import { Camera, Vec2, Vec3, geometry } from "cc";

export class GlobalConst {

    /** 是否中断相机的操作 */
    static interruptOp:boolean = false;

    /** 相机移动的方向 */
    static cameraMoveDir:Vec3 = new Vec3();

    static camera:Camera;
}



export const v2_1 = new Vec2();
export const v2_2 = new Vec2();
export const v2_3 = new Vec2();
export const v2_4 = new Vec2();

export const v3_1 = new Vec3();
export const v3_2 = new Vec3();
export const v3_3 = new Vec3();

export const ray = new geometry.Ray();