import { Node } from "cc";
import { Entity } from "./Entity";

export interface EntityComp{
    entity:Entity;
    node:Node;
}