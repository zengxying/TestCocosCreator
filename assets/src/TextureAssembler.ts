import { RenderData, renderer, Mat4, dynamicAtlasManager, gfx, IAssembler, RenderComponent, UITransform } from "cc";
import { CommonUtils } from "./CommonUtils";
import TexturePlus from "./TexturePlus";


const QUAD_INDICES = Uint16Array.from([0, 1, 2, 1, 3, 2]);

/**
 * assembler for texture
 */
export const TextureAssembler: IAssembler = {
    init(com:RenderComponent) {
        this._renderData = com.requestRenderData();
        const renderData = this._renderData;

        renderData.dataLength = 4;
        renderData.resize(4, 6);
        renderData.vertexRow = 2;
        renderData.vertexCol = 2;
        renderData.chunk.setIndexBuffer(QUAD_INDICES);

        this.initData();
        this.floatsPerVert = 5;
        this.uvOffset = 2;
        this.colorOffset = 4;
    },




    get verticesFloats() {
        return this.verticesCount * this.floatsPerVert;
    },


    initData() {
        let data = this._renderData;
        data.createQuadData(0, this.verticesFloats, this.indicesCount);
    },

    resetData(comp: TexturePlus) {
        let points = comp.polygon;
        if (!points || points.length < 3) return;
        this.verticesCount = points.length;
        this.indicesCount = this.verticesCount + (this.verticesCount - 3) * 2;
        this._renderData['clear']();
        this.initData();
    },

    initQuadIndices(indices: number[], arr: number[]) {
        for (let i = 0; i < arr.length; i++) {
            indices[i] = arr[i];
        }
    },

    /** 填充顶点的color */
    updateColor(comp: TexturePlus, color: number) {
        let uintVerts = this._renderData.uintVDatas[0];
        if (!uintVerts) return;
        color = color != null ? color : comp.node.color['_val'];
        let floatsPerVert = this.floatsPerVert;
        let colorOffset = this.colorOffset;

        let polygon = comp.polygon;
        for (let i = 0; i < polygon.length; i++) {
            uintVerts[colorOffset + i * floatsPerVert] = color;
        }
    },
    /** 更新uv */
    updateUVs(comp: TexturePlus) {
        let uvOffset = this.uvOffset;
        let floatsPerVert = this.floatsPerVert;
        let verts = this._renderData.vDatas[0];
        const contentSize = comp.node.getComponent(UITransform).contentSize;
        let uvs = CommonUtils.computeUv(comp.polygon, contentSize.width, contentSize.height)
        let polygon = comp.polygon;
        for (let i = 0; i < polygon.length; i++) {
            let dstOffset = floatsPerVert * i + uvOffset;
            verts[dstOffset] = uvs[i].x;
            verts[dstOffset + 1] = uvs[i].y;
        }
    },

    updateWorldVertsWebGL(comp: TexturePlus) {
        let verts = this._renderData.vDatas[0];

        let matrix: Mat4 = comp.node['_worldMatrix'];
        let a = matrix.m00, b = matrix.m01, c = matrix.m04, d = matrix.m05,
            tx = matrix.m12, ty = matrix.m13;

        let justTranslate = a === 1 && b === 0 && c === 0 && d === 1;
        let floatsPerVert = this.floatsPerVert;
        if (justTranslate) {
            let polygon = comp.polygon;
            for (let i = 0; i < polygon.length; i++) {
                verts[i * floatsPerVert] = polygon[i].x + tx;
                verts[i * floatsPerVert + 1] = polygon[i].y + ty;
            }
        } else {
            let polygon = comp.polygon;
            for (let i = 0; i < polygon.length; i++) {
                verts[i * floatsPerVert] = a * polygon[i].x + c * polygon[i].y + tx;
                verts[i * floatsPerVert + 1] = b * polygon[i].x + d * polygon[i].y + ty;
            }
        }
    },

    updateWorldVertsNative(comp: TexturePlus) {
        let verts = this._renderData.vDatas[0];
        let floatsPerVert = this.floatsPerVert;

        let polygon = comp.polygon;
        for (let i = 0; i < polygon.length; i++) {
            verts[i * floatsPerVert] = polygon[i].x;
            verts[i * floatsPerVert + 1] = polygon[i].y;
        }
    },

    updateWorldVerts(comp: TexturePlus) {
        // if (CC_NATIVERENDERER) {
        //     this.updateWorldVertsNative(comp);
        // } else {
            this.updateWorldVertsWebGL(comp);
        // }
    },

    /** 更新顶点数据 */
    updateVerts(comp: TexturePlus) {
        let indicesArr = CommonUtils.splitePolygon(comp.polygon);
        this.initQuadIndices(this._renderData.iDatas[0], indicesArr);
        this.updateWorldVerts(comp);
    },

    /** 更新renderdata */
    updateRenderData(comp: TexturePlus) {
        if (comp._vertsDirty) {
            this.resetData(comp);
            this.updateUVs(comp);
            this.updateVerts(comp);
            this.updateColor(comp, null);
            comp._vertsDirty = false;
        }
    },

    //每帧都会被调用
    fillBuffers(comp: TexturePlus, renderer) {
        if (renderer.worldMatDirty) {
            this.updateWorldVerts(comp);
        }

        let renderData = this._renderData;

        // vData里包含 pos， uv， color数据， iData中包含顶点索引
        let vData = renderData.vDatas[0];
        let iData = renderData.iDatas[0];

        let buffer = this.getBuffer();
        let offsetInfo = buffer.request(this.verticesCount, this.indicesCount);

        // buffer data may be realloc, need get reference after request.

        // fill vertices
        let vertexOffset = offsetInfo.byteOffset >> 2,
            vbuf = buffer._vData;
        if (vData.length + vertexOffset > vbuf.length) {
            vbuf.set(vData.subarray(0, vbuf.length - vertexOffset), vertexOffset);
        } else {
            vbuf.set(vData, vertexOffset);
        }

        // fill indices
        let ibuf = buffer._iData,
            indiceOffset = offsetInfo.indiceOffset,
            vertexId = offsetInfo.vertexOffset;
        for (let i = 0, l = iData.length; i < l; i++) {
            ibuf[indiceOffset++] = vertexId + iData[i];
        }
    },

    packToDynamicAtlas(comp: TexturePlus, frame: any) {

        if (!frame._original && dynamicAtlasManager && frame._texture.packable) {
            let packedFrame = dynamicAtlasManager.insertSpriteFrame(frame);
            if (packedFrame) {
                frame._setDynamicAtlasFrame(packedFrame);
            }
        }
        let material = comp['_materials'][0];
        if (!material) return;

        if (material.getProperty('texture') !== frame._texture) {
            // texture was packed to dynamic atlas, should update uvs
            comp._vertsDirty = true;
            comp._updateMaterial();
        }
    }
}