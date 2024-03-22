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
import { TestSprite } from "./TestSprite";

/**
 * @packageDocumentation
 * @module ui-assembler
 */


const QUAD_INDICES = Uint16Array.from([0, 1, 2, 1, 3, 2]);

/**
 * simple 组装器
 * 可通过 `UI.simple` 获取该组装器。
 */
export const surfaceAssembler: IAssembler = {
    createData(sprite: TestSprite) {

        const renderData = sprite.requestRenderData();
        if (this.isEllipse(sprite)) {
            const vertexCount = (sprite.ellipseSegment + 1) * 2;
            renderData.dataLength = vertexCount;
            renderData.resize(vertexCount, 6 * sprite.ellipseSegment);
            renderData.chunk.setIndexBuffer(this.getInitIdx(sprite));
        } else {

            renderData.dataLength = 4;
            renderData.resize(4, 6);
            renderData.vertexRow = 2;
            renderData.vertexCol = 2;
            renderData.chunk.setIndexBuffer(QUAD_INDICES);
        }
        return renderData;
    },

    resetRenderData(sprite: TestSprite) {
        var renderData = sprite.renderData;
        if (!renderData) {
            renderData = sprite.requestRenderData();
        }
        if (this.isEllipse(sprite)) {
            const vertexCount = (sprite.ellipseSegment + 1) * 2;
            renderData.dataLength = vertexCount;
            renderData.resize(vertexCount, 6 * sprite.ellipseSegment);
            this.updateVertexData(sprite);
            this.updateUVs(sprite);
            this.updateColor(sprite);
        } else {

            renderData.dataLength = 4;
            renderData.resize(4, 6);
            renderData.vertexRow = 2;
            renderData.vertexCol = 2;
            renderData.chunk.setIndexBuffer(QUAD_INDICES);
            this.updateColor(sprite);
        }
    },


    isEllipse(sprite: TestSprite) {
        return sprite.ellipseSegment > 1 && sprite.ellipseDepth !== 0;
    },

    updateRenderData(sprite: TestSprite) {
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

    updateWorldVerts(sprite: TestSprite, chunk: any) {
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

    fillBuffers(sprite: TestSprite, renderer: any) {
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
        if (this.isEllipse(sprite)) {
            this.setEllipseIdx(sprite);
        } else {
            this.setRectIdx(sprite);
        }
        // slow version
        // renderer.switchBufferAccessor().appendIndices(chunk);
    },


    setRectIdx(sprite: TestSprite) {
        const renderData = sprite.renderData!;
        const chunk = renderData.chunk;
        const bid = chunk.bufferId;
        const vidOrigin = chunk.vertexOffset;
        const meshBuffer = chunk.meshBuffer;
        const ib = chunk.meshBuffer.iData;
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
    },


    setEllipseIdx(sprite: TestSprite) {

        const renderData = sprite.renderData!;
        const chunk = renderData.chunk;
        const vidOrigin = chunk.vertexOffset;
        const meshBuffer = chunk.meshBuffer;
        const ib = chunk.meshBuffer.iData;
        let indexOffset = meshBuffer.indexOffset;

        var idxArr = [];
        const segment = sprite.ellipseSegment;
        for (let index = 0; index < segment; index++) {
            idxArr.push(segment + 1 + index, index, index + 1);
            idxArr.push(index + 1, segment + 1 + index, segment + 2 + index);
            ib[indexOffset++] = vidOrigin + segment + 1 + index;
            ib[indexOffset++] = vidOrigin + index;
            ib[indexOffset++] = vidOrigin + index + 1;


            ib[indexOffset++] = vidOrigin + index + 1;
            ib[indexOffset++] = vidOrigin + segment + 1 + index;
            ib[indexOffset++] = vidOrigin + segment + 2 + index;
        }
        // console.log(`renderData.dataList:${renderData.data}`);
        // console.log(`idxArr.len: ${idxArr.length}  6*segment: ${6 * segment} maxindex: ${segment + 1 + segment}`);
        meshBuffer.indexOffset += (6 * segment);
    },

    getInitIdx(sprite: TestSprite) {
        const segment = sprite.ellipseSegment;
        var idxArr = [];
        for (let index = 0; index < segment; index++) {
            idxArr.push(segment + 1 + index, index, index + 1);
            idxArr.push(index + 1, segment + 1 + index, segment + 2 + index);
        }
        return idxArr;
    },

    updateVertexData(sprite: TestSprite) {
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

        if (this.isEllipse(sprite)) {

            const ellipse_a = Math.abs(r - l) / 2;// 椭圆焦点数据  a
            const ellipse_b = sprite.ellipseDepth / 2;    // 椭圆焦点数据  b
            const ellipse_h = Math.abs(b - t);// 椭圆曲面高度
            const segment = sprite.ellipseSegment;
            const segmentRadians = Math.PI / segment;

            for (let index = 0; index <= segment; index++) {
                var radians = -Math.PI + segmentRadians * index;
                var x = ellipse_a * Math.cos(radians);
                var y = ellipse_b * Math.sin(radians);
                dataList[index].x = x;
                dataList[index].y = y - ellipse_h / 2;

                dataList[index + segment + 1].x = x;
                dataList[index + segment + 1].y = y + ellipse_h / 2;
            }
        } else {

            dataList[0].x = l;
            dataList[0].y = b;

            dataList[1].x = r;
            dataList[1].y = b;

            dataList[2].x = l;
            dataList[2].y = t;

            dataList[3].x = r;
            dataList[3].y = t;
        }
        renderData.vertDirty = true;
    },

    updateUVs(sprite: TestSprite) {
        if (!sprite.spriteFrame) return;
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        const uv = sprite.spriteFrame.uv;
        if (this.isEllipse(sprite)) {

            // uv  左下，右下，左上，右上
            const left = uv[0];
            const bottom = uv[1];
            const right = uv[2];
            const top = uv[5];
            const realW = Math.abs(right - left);
            const uiTrans = sprite.node._uiProps.uiTransformComp!;
            const cw = uiTrans.width;
            console.log("uv:" + uv,cw);
            const dataList: IRenderData[] = renderData.data;
            const maxUVX = sprite.ellipseWidth / cw;
            const startUvx = sprite.startUVX;
            var uvx = 0;
            for (let index = 0; index < renderData.dataLength; index++) {
                if (index <= sprite.ellipseSegment) {
                    uvx = startUvx + index / sprite.ellipseSegment * maxUVX + left;
                    // opengl坐标系，y轴向下  和 webgl展示的效果不一致
                    vData[index * renderData.floatStride + 4] = bottom;
                } else {
                    uvx = startUvx + (index - 1 - sprite.ellipseSegment) / sprite.ellipseSegment * maxUVX + left;
                    // opengl坐标系，y轴向下  和 webgl展示的效果不一致
                    vData[index * renderData.floatStride + 4] = top;
                }
                vData[index * renderData.floatStride + 3] = uvx;
            }
        } else {
            vData[3] = uv[0];
            vData[4] = uv[1];
            vData[12] = uv[2];
            vData[13] = uv[3];
            vData[21] = uv[4];
            vData[22] = uv[5];
            vData[30] = uv[6];
            vData[31] = uv[7];
        }
    },



    updateColor(sprite: TestSprite) {
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
