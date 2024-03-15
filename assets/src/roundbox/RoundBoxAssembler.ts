/*
 Copyright (c) 2017-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { IAssembler, Sprite, dynamicAtlasManager, IRenderData, RenderData } from "cc";
import { RoundBox } from "./RoundBox";

/**
 * @packageDocumentation
 * @module ui-assembler
 */





/**
 * simple 组装器
 * 可通过 `UI.simple` 获取该组装器。
 */
export const roundboxAssemble: IAssembler = {
    createData(sprite: RoundBox) {
        const renderData = sprite.requestRenderData();
        let corner = 0;
        corner += sprite.leftBottom ? 1 : 0;
        corner += sprite.leftTop ? 1 : 0;
        corner += sprite.rightTop ? 1 : 0;
        corner += sprite.rightBottom ? 1 : 0;
        const vertexNum = 12 + (sprite.segments - 1) * corner;
        renderData.dataLength = vertexNum;
        renderData.resize(vertexNum, 18 + sprite.segments * 3 * corner);

        renderData.chunk.setIndexBuffer(this.getVertexIb(sprite));
        return renderData;
    },

    updateRenderData(sprite: Sprite) {
        const frame = sprite.spriteFrame;

        dynamicAtlasManager.packToDynamicAtlas(sprite, frame);
        this.updateUVs(sprite);// dirty need
        //this.updateColor(sprite);// dirty need

        const renderData = sprite.renderData;
        if (renderData && frame) {
            if (renderData.vertDirty) {
                this.updateVertexData(sprite);
            }
            renderData.updateRenderData(sprite, frame);
        }
    },

    updateWorldVerts(sprite: Sprite, chunk: any) {
        const renderData = sprite.renderData!;
        const vData = chunk.vb;

        const dataList: IRenderData[] = renderData.data;
        const node = sprite.node;
        const m = node.worldMatrix;

        const stride = renderData.floatStride;
        let offset = 0;
        const length = dataList.length;
        for (let i = 0; i < length; i++) {
            const curData = dataList[i];
            const x = curData.x;
            const y = curData.y;
            let rhw = m.m03 * x + m.m07 * y + m.m15;
            rhw = rhw ? 1 / rhw : 1;

            offset = i * stride;
            vData[offset + 0] = (m.m00 * x + m.m04 * y + m.m12) * rhw;
            vData[offset + 1] = (m.m01 * x + m.m05 * y + m.m13) * rhw;
            vData[offset + 2] = (m.m02 * x + m.m06 * y + m.m14) * rhw;
        }
    },

    fillBuffers(sprite: Sprite, renderer: any) {
        if (sprite === null) {
            return;
        }

        const renderData = sprite.renderData!;
        const chunk = renderData.chunk;
        if (sprite.node.hasChangedFlags || renderData.vertDirty) {
            // const vb = chunk.vertexAccessor.getVertexBuffer(chunk.bufferId);
            this.updateWorldVerts(sprite, chunk);
            renderData.vertDirty = false;
        }

        // quick version
        const bid = chunk.bufferId;
        const vidOrigin = chunk.vertexOffset;
        const meshBuffer = chunk.meshBuffer;
        const ib = chunk.meshBuffer.iData;
        let indexOffset = meshBuffer.indexOffset;
        const indices = this.getVertexIb(sprite);
        for (let i = 0; i < renderData.indexCount; ++i) {
            const vid = indices[i];
            ib[indexOffset++] = vidOrigin + vid;
        }

        meshBuffer.indexOffset += renderData.indexCount;

        // slow version
        // renderer.switchBufferAccessor().appendIndices(chunk);
    },

    updateVertexData(sprite: RoundBox) {
        const renderData: RenderData | null = sprite.renderData;
        if (!renderData) {
            return;
        }

        const uiTrans = sprite.node._uiProps.uiTransformComp!;
        const dataList: IRenderData[] = renderData.data;
        const cw = uiTrans.width;
        const ch = uiTrans.height;
        const appX = uiTrans.anchorX * cw;
        const appY = uiTrans.anchorY * ch;
        let l = 0;
        let b = 0;
        let r = 0;
        let t = 0;
        if (sprite.trim) {
            l = -appX;
            b = -appY;
            r = cw - appX;
            t = ch - appY;
        } else {
            const frame = sprite.spriteFrame!;
            const originSize = frame.originalSize;
            const ow = originSize.width;
            const oh = originSize.height;
            const scaleX = cw / ow;
            const scaleY = ch / oh;
            const trimmedBorder = frame.trimmedBorder;
            l = trimmedBorder.x * scaleX - appX;
            b = trimmedBorder.z * scaleY - appY;
            r = cw + trimmedBorder.y * scaleX - appX;
            t = ch + trimmedBorder.w * scaleY - appY;
        }

        // 三个矩形
        const radius = sprite.radius;
        const bottom_r = b + radius;
        const top_r = t - radius;
        const left_r = l + radius;
        const right_r = r - radius;

        dataList[0].x = l;
        dataList[0].y = sprite.leftBottom ? bottom_r : b;
        dataList[1].x = l;
        dataList[1].y = sprite.leftTop ? top_r : t;
        dataList[2].x = left_r;
        dataList[2].y = sprite.leftTop ? top_r : t;
        dataList[3].x = left_r;
        dataList[3].y = sprite.leftBottom ? bottom_r : b;

        dataList[4].x = left_r;
        dataList[4].y = b;
        dataList[5].x = left_r;
        dataList[5].y = t;
        dataList[6].x = right_r;
        dataList[6].y = t;
        dataList[7].x = right_r;
        dataList[7].y = b;

        dataList[8].x = right_r;
        dataList[8].y = sprite.rightBottom ? bottom_r : b;
        dataList[9].x = right_r;
        dataList[9].y = sprite.rightTop ? top_r : t;
        dataList[10].x = r;
        dataList[10].y = sprite.rightTop ? top_r : t;
        dataList[11].x = r;
        dataList[11].y = sprite.rightBottom ? bottom_r : b;

        const segments = sprite.segments;
        var vertexCountIdx = 12;
        function createFanVertexs(startAngle: number, centerVec: { x: number, y: number }) {
            for (let index = 1; index < segments; index++) {

                var angle = startAngle * Math.PI / 180 - index / segments * Math.PI / 2;
                dataList[vertexCountIdx].x = centerVec.x + radius * Math.cos(angle);
                dataList[vertexCountIdx].y = centerVec.y + radius * Math.sin(angle);
                vertexCountIdx++;
            }
        }
        if (sprite.leftBottom) {
            createFanVertexs(270, dataList[3]);
        }
        if (sprite.leftTop) {
            createFanVertexs(180, dataList[2]);
        }
        if (sprite.rightTop) {
            createFanVertexs(90, dataList[9]);
        }
        if (sprite.rightBottom) {
            createFanVertexs(0, dataList[8]);
        }

        renderData.vertDirty = true;
    },


    getVertexIb(sprite: RoundBox) {

        let indexBuffer = [
            0, 1, 2, 2, 3, 0,
            4, 5, 6, 6, 7, 4,
            8, 9, 10, 10, 11, 8
        ]

        // 为四个角的扇形push进索引值
        let index = 12
        let fanIndexBuild = function(center, start, end) {
            let last = start;
            for (let i = 0; i < sprite.segments - 1; i++) {
                // 左上角 p2为扇形圆心，p1/p5为两个边界
                let cur = index;
                index++;
                indexBuffer.push(center, last, cur);
                last = cur;
            }
            indexBuffer.push(center, last, end)
        }
        if (sprite.leftBottom)
            fanIndexBuild(3, 4, 0);
        if (sprite.leftTop)
            fanIndexBuild(2, 1, 5);
        if (sprite.rightTop)
            fanIndexBuild(9, 6, 10);
        if (sprite.rightBottom)
            fanIndexBuild(8, 11, 7);
        return indexBuffer
    },

    updateUVs(sprite: Sprite) {
        if (!sprite.spriteFrame) return;
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        const uv = sprite.spriteFrame.uv;

        const uiTrans = sprite.node._uiProps.uiTransformComp!;
        const dataList: IRenderData[] = renderData.data;
        const cw = uiTrans.width;
        const ch = uiTrans.height;
        const appX = uiTrans.anchorX * cw;
        const appY = uiTrans.anchorY * ch;
        // uv  左下，右下，左上，右上
        const l = uv[0];
        const b = uv[1];
        const r = uv[2];
        const t = uv[5];

        const w_uv = Math.abs(r - l);
        const h_uv = Math.abs(b - t);
        for (let index = 0; index < renderData.dataLength; index++) {
            vData[index * renderData.floatStride + 3] = (dataList[index].x + appX) / cw * (w_uv) + l;
            vData[index * renderData.floatStride + 4] = (dataList[index].y + appY) / ch * (h_uv) + b;
        }
    },

    updateColor(sprite: Sprite) {
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        let colorOffset = 5;
        const color = sprite.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;
        for (let i = 0; i < renderData.dataLength; i++, colorOffset += renderData.floatStride) {
            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    },
};
