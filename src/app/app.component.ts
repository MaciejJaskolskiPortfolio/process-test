import { Component } from '@angular/core';
import {GraphLink, GraphNode} from "../../projects/ngx-process-graph/src/lib/models";
import {CircleNodeComponent} from "./circle-node/circle-node.component";

@Component({
  selector: 'app-root',
  template: `<lib-ngx-process-graph [nodes]="nodes" [links]="links"></lib-ngx-process-graph>`
})
export class AppComponent {
  nodes: GraphNode[] = [
    { id: '0', component: CircleNodeComponent, fx: 100, fy: 200 },
    { id: '1', component: CircleNodeComponent, fx: 250, fy: 200 },
    { id: '2', component: CircleNodeComponent,  fx: 400, fy: 200 },
    { id: '3', component: CircleNodeComponent,  fx: 550, fy: 200 },
    { id: '4', component: CircleNodeComponent,  fx: 400, fy: 350 }
  ];

  links: GraphLink[] = [
    { source: '0', target: '1', type: 'normal', icon: '⚡' },
    { source: '1', target: '2', type: 'normal', midpointNodeId: 'M1' },
    { source: '2', target: '3', type: 'normal', text: 'Hello', midpointNodeId: 'M2' },
    { source: '3', target: '1', type: 'top', text: 'Hello', color: 'green' },
    { source: '4', target: 'M1', type: 'midpoint'  },
    { source: '4', target: 'M2', type: 'midpoint' },
  ];
}
