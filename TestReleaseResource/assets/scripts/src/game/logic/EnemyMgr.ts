import { AssetManager, Node, Prefab, v3 } from "cc";
import { ResourceMgr } from "../../../core_tgx/base/ResourceMgr";
import { LocalConfig } from "../../../core_tgx/tool/localConfig";
import { PoolManager } from "../../tool/PoolManager";
import { Enemy } from "./Enemy";
import { ModuleDef } from "../../ModuleDef";
import { Handler } from "../../tool/Handler";
import { BaseInfo } from "../interface/TableInfo";
import { MonsterBloodBar } from "./MonsterBloodBar";

export class EnemyMgr {

    enemys: Enemy[];
    bloodBarMap: Map<string, MonsterBloodBar> = new Map();
    root: Node;
    bloodRoot: Node;

    bundleName: string = ModuleDef.GAME;
    private _resInited: boolean = false;

    private _bundle: AssetManager.Bundle;

    /**
     * 预加载敌人资源
     *
     * @param handler 加载完成后的回调函数
     */
    preloadEnemyRes(handler?: Handler) {
        ResourceMgr.inst.loadBundle(this.bundleName, (bundle: AssetManager.Bundle) => {
            this._bundle = bundle;
            bundle.loadDir("prefabs", (err, data) => {
                if (!err) {
                    this._resInited = true;
                    handler && handler.run();
                }
            });
        })
    }

    /**
     * 创建敌人实体
     *
     * @param id 敌人ID
     * @returns Promise<void>
     */
    public async createEnemy(id: string) {
        // 检查 baseInfo 是否存在
        let baseInfo = LocalConfig.instance.queryByID("base", id);
        if (!baseInfo) {
            console.error(`No base info found for enemy with ID: ${id}`);
            return;
        }
    
        const resPath = baseInfo.resPath;
        const bloodUrl = baseInfo.bloodUrl;
        const maxHp = baseInfo.maxHp;
        const hpAddition = baseInfo.hpAddition;
        const totalBlood = baseInfo.totalBlood;
        const offset = v3(baseInfo.offset[0], baseInfo.offset[1]);
    
        try {
            // 异步加载资源，并添加错误处理
            const [res, res01] = await Promise.all([
                ResourceMgr.inst.asyncloadRes(resPath, Prefab, this._bundle),
                ResourceMgr.inst.asyncloadRes(bloodUrl, Prefab, this._bundle)
            ]);
    
            let node = PoolManager.instance.getNode(res, this.root);
            if (!node) {
                console.error(`Failed to get node for enemy with ID: ${id}`);
                return;
            }
            const enemy = node.getComponent(Enemy);
            this.enemys.push(enemy);
    
            const entity = {
                maxHp, hp: maxHp,
                hpAddition, isDie: false,
                totalBlood, offsetPos: offset
            };
            enemy.initEntity(entity);
    
            node = PoolManager.instance.getNode(res01, this.bloodRoot);
            if (!node) {
                console.error(`Failed to get blood bar node for enemy with ID: ${id}`);
                return;
            }
            let bloodBar = node.getComponent(MonsterBloodBar);
            bloodBar.show(enemy, entity.totalBlood, entity.offsetPos, entity.hpAddition);
            this.bloodBarMap.set(enemy.uuid, bloodBar);
        } catch (error) {
            console.error(`Error creating enemy with ID: ${id}`, error);
        }
    }

    searchEnemy(){

    }
}