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


import { IAssembler, Sprite, dynamicAtlasManager, IRenderData, RenderData, Vec2, v2 } from "cc";

/**
 * @packageDocumentation
 * @module ui-assembler
 */
let l = 0;
let b = 0;
let r = 0;
let t = 0;

const QUAD_INDICES = Uint16Array.from([0, 1, 2, 1, 3, 2, 3, 1, 4]);

/**
 * simple 组装器
 * 可通过 `UI.simple` 获取该组装器。
 */
export const elipse: IAssembler = {
    createData(sprite: Sprite) {
        const renderData = sprite.requestRenderData();
        // 设置了五个顶点数据，内部会进行数组数据的初始化
        renderData.dataLength = 5;
        renderData.resize(5, 9);
        // 这个只是适用于当前代码中可以直接删除
        renderData.vertexRow = 3;
        renderData.vertexCol = 2;
        // 原生用的用于设置顶点索引数据
        renderData.chunk.setIndexBuffer(QUAD_INDICES);
        return renderData;
    },

    updateRenderData(sprite: Sprite) {
        const frame = sprite.spriteFrame;

        // dynamicAtlasManager.packToDynamicAtlas(sprite, frame);
        this.updateUVs(sprite);// dirty need
        //this.updateColor(sprite);// dirty need

        const renderData = sprite.renderData;
        if (renderData && frame) {
            if (renderData.vertDirty) {
                this.updateVertexData(sprite);
            }
            renderData.updateRenderData(sprite, frame); // 更新纹理缓冲区，可以不管
        }
    },

    updateWorldVerts(sprite: Sprite, chunk: any) {
        const renderData = sprite.renderData!;
        const vData = chunk.vb;

        const dataList: any[] = [
            { x: l, y: b },
            { x: r/2, y: b },
            { x: l, y: t },
            { x: r/2, y: t/2 }, //
            { x: r, y: t }, //
        ];

        console.log("单纯的替换了 数据，没有使用原来的数据格式 ")
        const node = sprite.node;
        const m = node.worldMatrix;

        const stride = renderData.floatStride;
        let offset = 0;
        const length = renderData.dataLength; // 用于遍历设置顶点数据
        for (let i = 0; i < length; i++) {
            const curData = dataList[i];
            const x = curData.x;
            const y = curData.y;
            let rhw = m.m03 * x + m.m07 * y + m.m15;
            rhw = rhw ? Math.abs(1 / rhw) : 1;

            offset = i * stride;
            vData[offset + 0] = (m.m00 * x + m.m04 * y + m.m12) * rhw;
            vData[offset + 1] = (m.m01 * x + m.m05 * y + m.m13) * rhw;
            vData[offset + 2] = (m.m02 * x + m.m06 * y + m.m14) * rhw;

        }

        // dataList[0].x = l;
        // dataList[0].y = b;

        // dataList[1].x = r;
        // dataList[1].y = b;

        // dataList[2].x = l;
        // dataList[2].y = t;

        // dataList[3].x = r;
        // dataList[3].y = t;
    },

    fillBuffers(sprite: Sprite, renderer: any) {
        console.log("zou ni !!!");
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
        const ib = chunk.meshBuffer.iData; // 设置索引数据，哪些索引组成了一个面
        let indexOffset = meshBuffer.indexOffset;

        // rect count = vertex count - 1
        for (let curRow = 0; curRow < renderData.vertexRow - 1; curRow++) {
            for (let curCol = 0; curCol < renderData.vertexCol - 1; curCol++) {
                // vid is the index of the left bottom vertex in each rect.
                const vid = vidOrigin + curRow * renderData.vertexCol + curCol;

                // left bottom
                ib[indexOffset++] = vid;
                // right bottom
                ib[indexOffset++] = vid + 1;
                // left top
                ib[indexOffset++] = vid + renderData.vertexCol;

                // right bottom
                ib[indexOffset++] = vid + 1;
                // right top
                ib[indexOffset++] = vid + 1 + renderData.vertexCol;
                // left top
                ib[indexOffset++] = vid + renderData.vertexCol;

                // IndexOffset should add 6 when vertices of a rect are visited.
                meshBuffer.indexOffset += 6;
            }
        }
        // slow version
        // renderer.switchBufferAccessor().appendIndices(chunk);
    },


    _getElipsePos(a: number, b: number, angle: number, out?: Vec2) {
        angle = angle * Math.PI / 180;
        var x = a * Math.cos(angle);
        var y = b * Math.sin(angle);
        out ||= v2();
        out.set(x, y);
        return out;
    },

    updateVertexData(sprite: Sprite) {
        const renderData: RenderData | null = sprite.renderData;
        if (!renderData) {
            return;
        }

        const uiTrans = sprite.node._uiProps.uiTransformComp!;
        const cw = uiTrans.width;
        const ch = uiTrans.height;
        const appX = uiTrans.anchorX * cw;
        const appY = uiTrans.anchorY * ch;

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
        // console.log("dataList: ", dataList)
        renderData.vertDirty = true;
    },

    updateUVs(sprite: Sprite) {
        if (!sprite.spriteFrame) return;
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        const uv = sprite.spriteFrame.uv;

        console.log("uv: ", uv, "vData: ", vData.length)
        vData[3] = 0;
        vData[4] = 1;
        vData[12] = 1;
        vData[13] = 1;
        vData[21] = 0;
        vData[22] = 0;
        vData[30] = 1;
        vData[31] = 0;
        vData[39] = 1;
        vData[40] = 1;
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
        const colorLen = renderData.dataLength;
        for (let i = 0; i < colorLen; i++, colorOffset += renderData.floatStride) {
            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    },
};
