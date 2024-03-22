import { resources, Asset, assetManager, AssetManager, error, SceneAsset } from "cc";
import Bundle = AssetManager.Bundle;
import { Log } from "../tool/Log";
class ResItem {
    public url: string;
    public isLoading = false;
    public callbackArr = [];
}

export class ResourceMgr {
    private static _inst: ResourceMgr = null;
    public static get inst(): ResourceMgr {
        if (!this._inst) {
            this._inst = new ResourceMgr();
        }
        return this._inst;
    }

    private loadingQueue: [] = [];

    public loadRes<T>(url: string, type: any, callback: (err, assets: T) => void, bundle: Bundle = resources) {
        let cache = bundle.get(url, type) as any;
        if (cache) {
            if (callback) {
                setTimeout(() => {
                    callback(null, cache);
                }, 10);
            }
            return;
        }
        let loadingItem: ResItem = this.loadingQueue[url];
        if (!loadingItem) {
            loadingItem = this.loadingQueue[url] = new ResItem();
            loadingItem.url = url;
        }
        loadingItem.callbackArr.push(callback);
        if (!loadingItem.isLoading) {
            loadingItem.isLoading = true;
            bundle.load(url, type, (err, asset: Asset) => {
                delete this.loadingQueue[url];
                for (let k in loadingItem.callbackArr) {
                    let cb = loadingItem.callbackArr[k];
                    if (cb) {
                        cb(err, asset);
                    }
                }
            });
        }
    }

    public loadBundleNameRes<T>(url: string, type: any, callback: (err, assets: T) => void, bundleName?: string) {
        let bundle = bundleName ? assetManager.getBundle(bundleName) : resources;
        if (!bundle) {
            assetManager.loadBundle(bundleName, null, (err, loadedBundle) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this.loadBundleNameRes(url, type, callback, bundleName);
                }
            });
            return;
        }
        this.loadRes(url, type, callback, bundle);
    }

    public loadBundle(path: string, cb: Function) {
        if (!path) {
            cb && cb(resources)
        } else {

            assetManager.loadBundle(path, (error, bundle) => {
                if (error) {
                    Log.error("加载分包出错:" + path);
                    return;
                }
                cb && cb(bundle);
            })
        }
    }

    public loadScene(bundle: Bundle | string, sceneName: string, onComplete: (err: Error, data: SceneAsset) => void, onProgress?: (finished: number, total: number, item: AssetManager.RequestItem) => void) {
        let realBundle;
        if (typeof bundle == "string") {
            realBundle = bundle ? assetManager.getBundle(bundle) : resources;
            if (!realBundle) {

                this.loadBundle(bundle, (res) => {
                    res.loadScene(sceneName, onProgress, onComplete);
                });
            } else {

                realBundle.loadScene(sceneName, onProgress, onComplete);
            }
            return;
        }
        bundle.loadScene(sceneName, onProgress, onComplete);
    }

    public async asyncloadRes<T>(url: string, type: any, bundle: Bundle = resources) {

        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {

            let cache = bundle.get(url, type) as any;
            if (cache) {
                resolve(cache);
                return;
            }
            let loadingItem: ResItem = this.loadingQueue[url];
            if (!loadingItem) {
                loadingItem = this.loadingQueue[url] = new ResItem();
                loadingItem.url = url;
            }
            loadingItem.callbackArr.push(resolve);
            if (!loadingItem.isLoading) {
                loadingItem.isLoading = true;
                bundle.load(url, type, (err, asset: Asset) => {
                    delete this.loadingQueue[url];
                    for (let k in loadingItem.callbackArr) {
                        let cb = loadingItem.callbackArr[k];
                        if (cb) {
                            cb(asset);
                        }
                    }
                });
            }
        })
    }

    public async asyncloadBundleNameRes<T>(url: string, type: any, bundleName?: string) {
        return new Promise((resolve: (value: unknown) => void, reject: (reason?: any) => void) => {

            let bundle = bundleName ? assetManager.getBundle(bundleName) : resources;
            if (!bundle) {
                assetManager.loadBundle(bundleName, null, async (err, loadedBundle) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    else {
                        const res = await this.asyncloadRes(url, type, loadedBundle);
                        resolve(res);
                    }
                });
                return;
            }
        });
    }

    public async asyncloadBundle(path: string) {
        return new Promise((resolve: (value: AssetManager.Bundle) => void, reject: (reason?: any) => void) => {
            if (!path) {
                resolve(resources)
            } else {

                assetManager.loadBundle(path, (error, bundle) => {
                    if (error) {
                        Log.error("加载分包出错:" + path);
                        reject(error);
                        return;
                    }
                    resolve(bundle);
                })
            }
        });
    }

    public async asyncloadScene(bundle: Bundle | string, sceneName: string, onProgress?: (finished: number, total: number, item: AssetManager.RequestItem) => void) {
        return new Promise(async (resolve: (value: SceneAsset) => void, reject: (reason?: any) => void) => {

            let realBundle: AssetManager.Bundle;
            if (typeof bundle == "string") {
                realBundle = bundle ? assetManager.getBundle(bundle) : resources;
                if (!realBundle) {
                    realBundle = await this.asyncloadBundle(bundle);
                }
                realBundle.loadScene(sceneName, onProgress, (err: Error, data: SceneAsset) => {
                    resolve(data);
                });
                return;
            }
            bundle.loadScene(sceneName, onProgress, (err: Error, data: SceneAsset) => {
                resolve(data);
            });
        });
    }
}