import { ecsclass, EcsSingleton, NodeComponent } from 'db://pkg/@gamex/cc-ecs';
import QuadTree from 'db://pkg/@gamex/cc-quadtree';

@ecsclass('DataSingleton')
export class DataSingleton extends EcsSingleton {
    over = false;
    quadTree = new QuadTree<NodeComponent>({ x: -2000, y: -2000, width: 4000, height: 4000 });
}