import { ISkillBase, ISkillEff, SkillData } from "./ISkill";

export class Skill implements ISkillBase {
    
    
    // 技能数据
    data: SkillData;
    // 技能特效
    eff: ISkillEff;

    // 是否可用
    isReady: boolean = true;
    // 冷却时间
    curTime: number = 0;

    // 施法时间
    releaseTime: number = 0;

    release(): void {
        this.isReady = false;
        this.curTime = this.data.remainingCooldown;
        this.releaseTime = this.data.releaseTime;
        this.eff.show();
    }

    cancel(): void {
        this.eff.hide();
    }

    update(dt: number): void {
        if (this.curTime) {
            this.curTime -= dt;
            if (this.curTime <= 0) {
                this.isReady = true;
                this.curTime = 0;
            }
        }
        if (this.releaseTime) {
            this.releaseTime -= dt;
            this.eff.update(dt);
            if (this.releaseTime <= 0) {
                this.eff.hide();
                this.over();
                this.releaseTime = 0;
            }
        }
    }

    over(): void {
        throw new Error("Method not implemented.");
    }

    canRelease(): boolean {
        return this.isReady;
    }

    /**
     * 重置冷却时间
     */
    resetCooldowns(){
        this.isReady = true;
        this.curTime = 0;
    }


    isComplate(): boolean {
        return this.releaseTime === 0;
    }

    recover(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 打断动画
     *
     * @returns 无返回值
     */
    interrupt(): void {
        this.eff.hide();
        this.releaseTime = 0;
    }
}

export class SkillManager {

    skills: ISkillBase[] = []; // 技能数组
    onceSkills: ISkillBase[] = []; // 一次性技能数组
    autoRelese: boolean = true; // 自动释放技能

    constructor() {
        this.skills = [];
    }

    addSkill(skill:ISkillBase) {
        this.skills.push(skill);
    }

    update(dt:number) {

        const len = this.onceSkills.length;
        if(len > 0){
            for (let index = len - 1; index >= 0; index--) {
                const skill = this.onceSkills[index];
                skill.update(dt);
                if(skill.isComplate()){
                    this.onceSkills.splice(index, 1);
                    skill.recover();
                }
            }
        }

        for (const skill of this.skills) {
            skill.update(dt);
            if (this.autoRelese && skill.canRelease()) {
                skill.release();
            }
        }

        
    }

    resetAllCooldowns() {
        for (const skill of this.skills) {
            skill.resetCooldowns();
        }
    }

    /**
     * 释放技能
     *
     * @param skillId 技能 ID
     */
    releaseSkill(skillId:number) {
        const skill = this.skills.find((s) => s.data.id === skillId);
        if (skill) {
            skill.release();
        } else {
            console.log(`技能 ${skillId} 不存在`);
        }
    }

    /**
     * 一次性释放技能
     *
     * @param skill 技能对象
     */
    releaseSkillOnce(skill:ISkillBase) {
        skill.release();
        this.onceSkills.push(skill);
    }

    interruptSkill(skillID:number) {
        const skill = this.skills.find((s) => s.data.id === skillID);
        if (skill) {
            skill.interrupt();
        } else {
            console.log(`技能 ${skillID} 不存在`);
        }
    }
}