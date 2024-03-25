import { _decorator } from 'cc';
import BaseView from '../../../../../../extensions/app/assets/base/BaseView';
import { IMiniViewNames } from '../../../../../app-builtin/app-admin/executor';
import { app } from '../../../../../app/app';
const { ccclass, property } = _decorator;
@ccclass('PageHome')
export class PageHome extends BaseView {
    // 子界面
    protected miniViews: IMiniViewNames = ['PaperHomeIndex'];

    // 记录首次加载
    private static first = true;

    // 初始化的相关逻辑写在这
    onLoad() { }

    beforeShow(next: (error?: string) => void) {
        if (PageHome.first) {
            next();
            this.initUI();
            PageHome.first = false;
        } else {
            this.initUI(next);
        }
    }

    // 界面打开时的相关逻辑写在这(onShow可被多次调用-它与onHide不成对)
    onShow(params: any) {
    }

    // 界面关闭时的相关逻辑写在这(已经关闭的界面不会触发onHide)
    onHide(result: undefined) {
        // app.manager.ui.show<PageHome>({name: 'PageHome', onHide:(result) => { 接收到return的数据，并且有类型提示 }})
        return result;
    }

    private initUI(onFinish?: Function) {
        this.showMiniViews({
            views: this.miniViews,
            onFinish() {
                app.manager.sound.playMusic({ name: 'music/home' });
                onFinish && onFinish();
                // 预加载
                app.lib.task.createSync()
                    .add(next => app.manager.ui.load('PageGame', next))
                    .add(next => app.manager.ui.load('PaperGameIndex', next))
                    .add(next => app.manager.sound.load('music/war', next))
                    .add(next => app.manager.sound.load('effect/shoot', next))
                    .add(next => app.manager.sound.load('effect/hit', next))
                    .add(next => app.manager.sound.load('effect/eat', next))
                    .add(next => app.manager.ui.load('PopOver', next))
                    .add(next => app.manager.sound.load('music/over', next))
                    .add(next => app.manager.ui.load('PopTip', next))
                    .start();
            }
        })
    }
}