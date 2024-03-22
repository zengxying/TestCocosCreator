import { math } from "cc";

export interface Entity {
    maxHp: number;
    hp: number;
    isDie: boolean;

    totalBlood: number;
    offsetPos: math.Vec3;
    hpAddition: number;
}