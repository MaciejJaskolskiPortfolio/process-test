import {Type} from "@angular/core";

export interface GraphNode {
  id: string;
  x?: number;
  y?: number;
  fx: number;
  fy: number;
  component: Type<any>;
}
