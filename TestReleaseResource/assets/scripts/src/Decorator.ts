//Decorator.ts

type PropertyDecorator = (
    $class: Record<string, any>, $propertyKey: string | symbol, $descriptorOrInitializer?: any,
) => void;

import { Node } from "cc"

const searchChild = function (node: Node, name: string) {
    let ret = node.getChildByName(name);
    if (ret) return ret;
    for (let i = 0; i < node.children.length; i++) {
        let child = node.children[i];
        if (!child.isValid) continue;
        ret = searchChild(child, name);
        if (ret) return ret;
    }
    return null;
}

const CookDecoratorKey = ($desc: string) => `__ccc_decorator_${$desc}__`

const KeyChild = CookDecoratorKey("child_cache");
type ParamType = {
    name?: string,
};

export function child($opt?: ParamType): PropertyDecorator {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return ($target, $propertyKey: string, $descriptorOrInitializer) => {
        const cache: { propertyKey: string, childName: string }[] = $target[KeyChild] ??= [];
        if (!cache.some($vo => $vo.propertyKey === $propertyKey)) {
            cache.push({ propertyKey: $propertyKey, childName: $opt?.name || $propertyKey });
        } else {
            throw new Error(`child 装饰器重复绑定属性：${$propertyKey}，class：${$target.name}`);
        }
        if (cache.length === 1) {
            const oldOnLoad: () => void = $target.onLoad || undefined;//$target.onLoad也可以拿到父类的实现
            $target.onLoad = function () {
                cache.forEach($vo => this[$vo.propertyKey] = searchChild(this.node, $vo.childName));
                oldOnLoad && oldOnLoad.apply(this);
            };
        }
    };
}

import { Component } from "cc";

interface INewable<T = any> extends Function {
    new(...args: any[]): T;
}

const KeyComp = CookDecoratorKey("comp_cache");

export function comp($compoentClass: INewable<Component>, $childName?: string, $mute = false): PropertyDecorator {
    return ($target, $propertyKey: string, $descriptorOrInitializer) => {
        const cache: { propertyKey: string, compClass: INewable<Component>, childName: string }[] = $target[KeyComp] ??= [];
        if (!cache.some($vo => $vo.propertyKey === $propertyKey)) {
            cache.push({ propertyKey: $propertyKey, compClass: $compoentClass, childName: $childName || $propertyKey });
        } else {
            if (!$mute) {
                throw new Error(`comp装饰器重复绑定属性：${$propertyKey}，class：${$target.name}`);
            }
            return;
        }
        if (cache.length === 1) {
            const oldOnLoad: () => void = $target.onLoad || undefined;//$target.onLoad也可以拿到父类的实现
            $target.onLoad = function () {
                cache.forEach($vo => {
                    const node = ($vo.childName ? searchChild(this.node, $vo.childName) : this.node);
                    if (!node) {
                        if (!$mute) {
                            throw new Error(`comp装饰器没有找到适合的node节点：class：${$target.name}，组件：${$compoentClass.name}，childName：${$childName}`);
                        } else {
                            return;
                        }
                    }
                    this[$vo.propertyKey] = node.getComponent($vo.compClass) || node.addComponent($vo.compClass);
                });
                oldOnLoad && oldOnLoad.apply(this);
            };
        }
    };
}