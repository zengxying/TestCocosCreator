import { Component, Graphics, UITransform, _decorator } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('UIMgrLoading')
@requireComponent(Graphics)
@requireComponent(UITransform)
export default class UIMgrLoading extends Component {
    @property({ tooltip: '等待几秒后开始动画' })
    private delay = 0;

    private progress = 0;
    private ringScale = 1;
    private reverse = false;

    private angleSpeed = 120;
    private ringSpeed = 0.02;

    private show = false;
    private draw = false;

    protected onEnable() {
        if (!this.show) {
            this.progress = 0;
            this.ringScale = 1;
            this.node.angle = 0;
            this.reverse = false;
            this.onDraw();
            
            this.scheduleOnce(() => {
                this.draw = true;
            }, this.delay);
        }
        this.show = true;
    }

    protected onDisable() {
        this.draw = false;
        this.show = false;
        this.unscheduleAllCallbacks();
    }

    /**
     * 需要重写
     */
    private onDraw() {
        const uiTransform = this.node.getComponent(UITransform);

        const graphics = this.getComponent(Graphics);
        const centerX = uiTransform.width * (0.5 - uiTransform.anchorX);
        const centerY = uiTransform.height * (0.5 - uiTransform.anchorY);

        const r = Math.min(uiTransform.width / 2, uiTransform.height / 2);

        const allPI = Math.PI;
        const offst = 0;

        graphics.clear();
        if (this.reverse) {
            const start = 0.5 * Math.PI + offst;
            const end = 0.5 * Math.PI + this.progress * 2 * allPI + offst;
            graphics.arc(centerX, centerY, r, start, end, true);
        } else {
            const start = 0.5 * Math.PI - offst;
            const end = 0.5 * Math.PI - this.progress * 2 * allPI - offst;
            graphics.arc(centerX, centerY, r, start, end, false);
        }
        graphics.stroke();
    }

    protected update(dt: number): void {
        if (!this.draw) return;
        // 旋转
        this.node.angle -= this.angleSpeed * dt;
        if (this.node.angle >= 360 || this.node.angle <= -360) {
            this.node.angle = this.node.angle % 360;
        }

        // 进度
        if (this.ringScale > 0) {
            this.progress = Math.min(1, this.progress + this.ringSpeed * this.ringScale);

            if (this.progress == 1) {
                this.ringScale = -1;
                this.reverse = !this.reverse;
            }
        } else {
            this.progress = Math.max(0, this.progress + this.ringSpeed * this.ringScale);

            if (this.progress == 0) {
                this.ringScale = 1;
                this.reverse = !this.reverse;
            }
        }

        this.onDraw();
    }
}
