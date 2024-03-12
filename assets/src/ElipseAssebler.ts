
/**
 * @packageDocumentation
 * @module ui-assembler
 */

import { IAssembler, IRenderData, RenderData, Sprite, dynamicAtlasManager } from "cc";



const QUAD_INDICES = Uint16Array.from([0, 1, 2, 1, 3, 2]);

/**
 * simple 组装器
 * 可通过 `UI.simple` 获取该组装器。
 */
export const elipse: IAssembler = {
    createData (sprite: Sprite) {
        const renderData = sprite.requestRenderData();
        renderData.dataLength = 4;
        renderData.resize(4, 6);
        renderData.vertexRow = 2;
        renderData.vertexCol = 2;
        renderData.chunk.setIndexBuffer(QUAD_INDICES);
        return renderData;
    },

    updateRenderData (sprite: Sprite) {
        const frame = sprite.spriteFrame;
        
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

    updateWorldVerts (sprite: Sprite, chunk: any) {
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
            rhw = rhw ? Math.abs(1 / rhw) : 1;

            offset = i * stride;
            vData[offset + 0] = (m.m00 * x + m.m04 * y + m.m12) * rhw;
            vData[offset + 1] = (m.m01 * x + m.m05 * y + m.m13) * rhw;
            vData[offset + 2] = (m.m02 * x + m.m06 * y + m.m14) * rhw;
        }
    },

    fillBuffers (sprite: Sprite) {
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
        // slow version
        // renderer.switchBufferAccessor().appendIndices(chunk);
    },

    updateVertexData (sprite: Sprite) {
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

        dataList[0].x = l;
        dataList[0].y = b;

        dataList[1].x = r;
        dataList[1].y = b;

        dataList[2].x = l;
        dataList[2].y = t;

        dataList[3].x = r;
        dataList[3].y = t;

        renderData.vertDirty = true;
    },

    updateUVs (sprite: Sprite) {
        if (!sprite.spriteFrame) return;
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        const uv = sprite.spriteFrame.uv;
        vData[3] = uv[0];
        vData[4] = uv[1];
        vData[12] = uv[2];
        vData[13] = uv[3];
        vData[21] = uv[4];
        vData[22] = uv[5];
        vData[30] = uv[6];
        vData[31] = uv[7];
    },


};

