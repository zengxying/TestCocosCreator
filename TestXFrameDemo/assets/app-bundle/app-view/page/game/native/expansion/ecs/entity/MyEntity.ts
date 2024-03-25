import { EcsEntity } from 'db://pkg/@gamex/cc-ecs';
import { DataSingleton } from '../singleton/DataSingleton';

export class MyEntity extends EcsEntity {
   static recovery = true;
   protected onDisable() {
      if (this.rid === 0) return
      this.ecs.getSingleton(DataSingleton).quadTree.remove(this.rid);
      this.rid = 0;
   }

   rid = 0;
}