import { Asset, AssetManager, Node, Sprite, SpriteFrame, UIOpacity, UITransform, director, resources } from 'cc';
import * as spriter from './Spriter';
import { xml2json } from './xml2json';
import { ResourceMgr } from '../../core_tgx/base/ResourceMgr';
import { Handler } from './Handler';
import { Log } from '../../core_tgx/tool/Log';

export class SCMLAnimation {

    private container: Node;
    aniSprites: Sprite[] = [];
    pose: spriter.Pose;

    private _inited: boolean;

    private _scale:number = 1;
    private _playCount:number = 0;
    private _curPlayCount:number = 0;
    private _aniName:string;

    _events:Record<string, AniEventObj[]> = {};
    destroyed: boolean = false;

    private _assets:Asset[];

    // "res/ani/test"
    constructor(dirPath: string, aniName:string, parent?: Node, bundleName?: string) {

        this.container = new Node(dirPath);
        parent ||= director.getScene();
        this.container.setParent(parent);
        this.container.layer = parent.layer;
        this.container.active = false;
        this._inited = false;
        this._aniName = aniName;
        this._curPlayCount = 0;
        this._playCount = -1;

        ResourceMgr.inst.loadBundle(bundleName, (bundle: AssetManager.Bundle) => {
            if(this.destroyed){
                return;
            }
            bundle.loadDir(dirPath, (err: any, data: any[]) => {

                if(this.destroyed){
                    return;
                }
                this._assets = data;
                this._assets.forEach(item=>item.addRef());
                const res = data.find(item => item._name == "Animations");
                if (res) {
                    this._parseAnimation(res._name + res._native, res._file);

                    const spriter_pose = this.pose;
                    spriter_pose.update(0);
                    spriter_pose.strike();
                    const $self = this;
                    const objArr:spriter.SpriteObject[] = <spriter.SpriteObject[]>spriter_pose.object_array;
                    objArr.forEach(function (object): void {
                        const sprite_object: spriter.SpriteObject = <spriter.SpriteObject>object;

                        switch (object.type) {
                            case 'sprite':
                                const sf = data.find(r => r._name == sprite_object.name);
                                if (sf) {
                                    $self._createSprite(sf, sprite_object.name);
                                }
                                break;
                        }
                    });

                    // objArr.forEach((item, idx)=>{
                    //     var sp;
                    //     if ($self.aniSprites[idx].node.name == item.name) {
                    //         sp = $self.aniSprites[idx];
                    //     } else {
                    //         sp = $self.aniSprites.find(item => item.node.name == item.name);
                    //     }
                    //     const bone = spriter_pose.bone_array[item.parent_index];
                    //     if(bone){
                    //         if(bone.parent_index != -1){
                    //             const spidx = objArr.findIndex(obj=> obj.parent_index == bone.parent_index);
                    //             if(spidx >= 0){
                    //                 sp.node.setParent(this.aniSprites[spidx].node);
                    //             }
                    //         }
                    //     }
                    // });


                }
                if(aniName){
                    this.container.active = true;
                }
                this._inited = true;
            });
        })
    }


    private _updateBoneParent(objArr:spriter.SpriteObject[], spriter_pose:spriter.Pose){
        objArr.forEach((item, idx)=>{
            const sp = this.aniSprites[idx];
            const bone = spriter_pose.bone_array[item.parent_index];
            if(bone){
                if(bone.parent_index != -1){
                    const spidx = objArr.findIndex(obj=> obj.parent_index == bone.parent_index);
                    sp.node.setParent(this.aniSprites[spidx].node);
                }
            }
        });
    }

    private _getFile(spriter_pose: spriter.Pose, object: spriter.BaseObject): spriter.ImageFile {
        const sprite_object: spriter.SpriteObject = <spriter.SpriteObject>object;
        const folder: spriter.Folder = spriter_pose.data.folder_array[sprite_object.folder_index];
        if (!folder) { return; }
        return <spriter.ImageFile>folder.file_array[sprite_object.file_index];
    }

    private _createSprite(sf: SpriteFrame, name: string) {
        let node = new Node(name);
        let sp = node.addComponent(Sprite);
        sp.spriteFrame = sf;
        this.container.addChild(node);
        node.layer = this.container.layer;
        this.aniSprites.push(sp);
    }

    private _updateSpriteTransformInfo(spriter_pose: spriter.Pose) {
        const $self = this;

        spriter_pose.object_array.forEach(function (object: spriter.BaseObject, index: number): void {
            switch (object.type) {
                case 'sprite':
                    var sp: Sprite;
                    const sprite_object: spriter.SpriteObject = <spriter.SpriteObject>object;
                    if ($self.aniSprites[index].node.name == object.name) {
                        sp = $self.aniSprites[index];
                    } else {

                        sp = $self.aniSprites.find(item => item.node.name == object.name);
                    }

                    const space = sprite_object.world_space;
                    const pos = space.position;
                    const scale = space.scale;
                    const rotation = space.rotation.deg;
                    const pivot = sprite_object.pivot;
                    var uiop: UIOpacity;
                    const uiopKey = "$UIOpacity"
                    if(sprite_object.alpha != 1 && !sp[uiopKey]){
                        uiop = sp.node.getComponent(UIOpacity) || sp.node.addComponent(UIOpacity);
                        sp[uiopKey] = uiop;
                    }else{
                        uiop = sp[uiopKey];
                    }
                    uiop && (uiop.opacity = 255 * sprite_object.alpha);

                    sp.node.setPosition(pos.x, pos.y, 0);
                    sp.node.setScale(scale.x, scale.y, 1);
                    // const key = "$transform";
                    // if(sp[key]){
                    //     sp[key] = sp.getComponent(UITransform);
                    // }
                    // const uitrans:UITransform = sp[key];
                    // uitrans.setAnchorPoint(pivot.x, pivot.y);
                    sp.node.angle = rotation;
                    break;
            }
        });
    }

    private _parseAnimation(fileName: string, content: string) {
        const match: RegExpMatchArray = fileName.match(/\.scml$/i);
        var spriter_data: spriter.Data;
        var spriter_pose: spriter.Pose;
        if (match) {
            const parser: DOMParser = new DOMParser();
            // replace &quot; with \"
            const xml_text: string = content.replace(/&quot;/g, "\"");
            const xml: any = parser.parseFromString(xml_text, 'text/xml');
            let json_text: string = xml2json(xml, '\t');
            // attributes marked with @, replace "@(.*)": with "\1":
            json_text = json_text.replace(/"@(.*)":/g, "\"$1\":");
            const json: any = JSON.parse(json_text);
            const spriter_json: any = json.spriter_data;
            spriter_data = new spriter.Data().load(spriter_json);
        } else {
            spriter_data = new spriter.Data().load(JSON.parse(content));
        }

        spriter_pose = new spriter.Pose(spriter_data);
        const keys = spriter_pose.getAnimKeys();
        const idx = keys.indexOf(this._aniName);
        if(idx >= 0){
            spriter_pose.setAnim(this._aniName); // set animation by name
        }else{
            Log.warn("没有对应的动画名字：", keys);
            this._aniName = keys[0];
            spriter_pose.setAnim(keys[0]);
        }
        this.pose = spriter_pose;
    }

    public update(dt: number) {
        if (this._inited && (this._playCount == -1 || this._curPlayCount < this._playCount)) {
            dt = dt * 1000 * this._scale;
            this._checkerAniFrame(dt);
            this.pose.update(dt);
            this.pose.strike();
            this._updateSpriteTransformInfo(this.pose);
        }
    }

    private _checkerAniFrame(dt:number){
        const ani = this.pose.curAnim();
        const curTime = this.pose.time + dt;
        if(curTime >= ani.max_time){
            // 结束一次播放时间
            this._curPlayCount ++;
        }
        Log.log(`this.pose.time:${this.pose.time} , ani.max_time:${ani.max_time} , ani.name:${ani.name}`);
        let lv = (curTime - ani.min_time) / (ani.max_time - ani.min_time);
        const eventArr = this._events[this._aniName];
        if(eventArr){
            // 通过播放动画的次数 和播放比例来判定是否到了事件帧
            const event = eventArr.find(event=> event.frameLv <= lv && event.curCount != this._curPlayCount);
            if(event){
                event.handler && event.handler.run();
                event.curCount = this._curPlayCount;
            }
        }
    }

    /**
     * 注册比例帧事件
     * @param aniName 动画名     
     * @param frameLv 帧比例    
     * @param handler 回调
     */
    public regsterFrameEvent(aniName:string, frameLv:number, handler:Handler){
        this._events[aniName] ||= [];
        const arr = this._events[aniName];
        arr.push({
            frameLv:frameLv,
            handler:handler,
            curCount: -1
        });
    }

    public removeFrameEvent(aniName:string, frameLv:number){
        const arr = this._events[aniName];
        if(arr){
            const idx = arr.findIndex(item=>item.frameLv == frameLv);
            if(idx >= 0){
                
                let eventObj = arr.splice(idx, 1);
                eventObj[0].handler.recover();
            }
        }
    }

    
    /**
     * 
     * @param aniName 要播放的动画名字
     * @param playCount 是否循环播放 == -1 为循环播放  
     * @param scale 播放速度
     * @param lv 开始的时间比例  在当前动画开始时间和结束时间的中间
     */
    public playAni(aniName:string, playCount:number = 1, scale:number = 1, lv:number = 0){
        this._aniName = aniName;
        this.pose.setAnim(this._aniName); // set animation by name
        const ani = this.pose.curAnim();
        const curTime = (ani.max_time - ani.min_time) * lv + ani.min_time;
        this.pose.setTime(curTime);
        this._playCount = playCount;
        this._curPlayCount = 0;
        this._scale = scale;
        this.container.active = true;
    }

    public destroy(){
        this._inited = false;
        this.container.destroyAllChildren();
        this.container.destroy();
        const arr = Object.values(this._events)
        arr.forEach(item => item.forEach(ev=> ev.handler.recover()));
        this._events = null;
        this.aniSprites = null;
        this.pose = null;
        this.destroyed = true;
        if(this._assets){
            this._assets.forEach(item=>item.decRef());
        }
    }
}

interface AniEventObj {
    /*动画整体时间的某个比例点触发 [0 - 1]*/
    frameLv:number;
    /* 回调 */
    handler:Handler;
    /** 当前次数 */
    curCount:number;
}