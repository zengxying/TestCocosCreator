import { Animation, AnimationClip, Node, SpriteFrame } from "cc";

/**
 * 创建动画clip
 * @param sps 动画剪辑
 * @param node 
 * @param sort (a:SpriteFrame, b: SpriteFrame) => number;
 */
export function createClip(sps: SpriteFrame[], node: Node, aniName: string, speed: number, mode: AnimationClip.WrapMode = AnimationClip.WrapMode.Loop) {

    var _animation = node.getComponent(Animation) || node.addComponent(Animation);//添加动画组建
    let frames: SpriteFrame[] = sps;//this.sprAtlas.getSpriteFrames();//data.getSpriteFrames();
    
    var clip = AnimationClip.createWithSpriteFrames(frames, frames.length);//创建动画帧图
    //添加偏移
    frames.forEach((v, k) => {
        var x = v['_offset']['x'];
        var y = v['_offset']['y'];
        console.log(speed / frames.length * k);
        // 添加帧事件
        clip.events.push({
            frame: speed / frames.length * k,         // 秒
            func: "setOffSet",// 回调函数名称
            //@ts-ignore
            params: [x, y, k]    // 回调参数
        });
    });
    clip.name = aniName;
    clip.speed = speed;//速度
    clip.wrapMode = mode;//模式
    _animation.defaultClip = clip;
    _animation.addClip(clip);

    return _animation;
}