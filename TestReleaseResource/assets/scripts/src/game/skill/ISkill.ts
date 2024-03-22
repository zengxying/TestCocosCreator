import { Node } from "cc";

export enum MoveType{
    NONE,
    LINE,
    CRICLE,
    PARABOLA,
}

export interface IPathMove {
    target:Node;
    speed:number;
    moveType:MoveType;
}

export interface ISkillEff {
    update(dt: number): void;
    show(): void;
    hide(): void;
    hitEff(): void;
    spEff(): void;
}

export interface SkillData {
    id: number;
    // 冷却时间
    remainingCooldown: number;
    // 释放时间
    releaseTime: number;
}

export interface ISkillBase {
    /**
     * 技能数据
     */
    data: SkillData;
    /**
     * 技能特效
     */
    eff: ISkillEff;
    
    /**
     * 释放技能
     */
    release(): void;
    /**
     * 取消释放
     */
    cancel(): void;

    update(dt:number): void;
    /**
     * 技能结束
     */
    over(): void;
    canRelease(): boolean;

    /**
     * 恢复冷却
     */
    resetCooldowns(): void;
    isComplate(): boolean;
    /**
     * 恢复技能, 子类重写复用该方法
     */
    recover(): void;

    /**
     * 释放技能
     */
    interrupt(): void;
}