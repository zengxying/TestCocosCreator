/* eslint-disable */
import { Component } from 'cc';
import { app } from '../../app/app';
import { DEV,EDITOR } from 'cc/env';

import {TestFlowMgrManager} from '../app-manager/test-flow-mgr/TestFlowMgrManager'
import EventManager from '../../../extensions/app/assets/manager/event/EventManager'
import LoaderManager from '../../../extensions/app/assets/manager/loader/LoaderManager'
import SoundManager from '../../../extensions/app/assets/manager/sound/SoundManager'
import TimerManager from '../../../extensions/app/assets/manager/timer/TimerManager'
import UIManager from '../../../extensions/app/assets/manager/ui/UIManager'
enum viewNames { 'PageGame','PageHome','PageOver','PageTestFlow','PopTip'}
const miniViewNames = {"PaperAllIndex":"PaperAll","PaperGameIndex":"PaperGame","PaperHomeIndex":"PaperHome","PaperOverIndex":"PaperOver"}
export enum musicNames { 'never'}
export enum effectNames { 'effect/button'}

export type IViewName = keyof typeof viewNames
export type IViewNames = IViewName[]
export type IMiniViewName = keyof typeof miniViewNames
export type IMiniViewNames = IMiniViewName[]
export type IMusicName = keyof typeof musicNames
export type IMusicNames = IMusicName[]
export type IEffectName = keyof typeof effectNames
export type IEffectNames = IEffectName[]

if(!EDITOR||DEV) Array.prototype.push.apply(app.scene, ["PageGame"])
if(!EDITOR||DEV) Object.assign(app.data, {})
if(!EDITOR||DEV) Object.assign(app.config, {})
if(!EDITOR||DEV) Object.assign(app.store, {})

type IReadOnly<T> = { readonly [P in keyof T]: T[P] extends Function ? T[P] : (T[P] extends Object ? IReadOnly<T[P]> : T[P]); };
export type IApp = {
    Manager: {TestFlowMgr:Omit<typeof TestFlowMgrManager,keyof Component>,Event:Omit<typeof EventManager,keyof Component>,Loader:Omit<typeof LoaderManager,keyof Component>,Sound:Omit<typeof SoundManager,keyof Component>,Timer:Omit<typeof TimerManager,keyof Component>,UI:Omit<typeof UIManager,keyof Component>},
    manager: {testflowmgr:Omit<TestFlowMgrManager,keyof Component>,event:Omit<EventManager,keyof Component>,loader:Omit<LoaderManager,keyof Component>,sound:Omit<SoundManager<IEffectName,IMusicName>,keyof Component>,timer:Omit<TimerManager,keyof Component>,ui:Omit<UIManager<IViewName,IMiniViewName>,keyof Component>},
    data: {},
    config: {}
    store: {}
    scene: IViewName[]
}
