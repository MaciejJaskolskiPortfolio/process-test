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
    { id: '3', component: CircleNodeComponent,  fx: 550, fy: 200 }
  ];

  links: GraphLink[] = [
    { source: '0', target: '1', type: 'normal', icon: 'circle' },
    { source: '1', target: '2', type: 'normal' },
    { source: '2', target: '3', type: 'normal', text: 'Hello' },
    { source: '3', target: '1', type: 'top', color: 'green', text: 'Invoice Flow' },
    { source: '3', target: '1', type: 'bottom', color: 'blue', text: 'Flow' },
  ];
}
