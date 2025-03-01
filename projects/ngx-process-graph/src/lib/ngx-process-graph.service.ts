import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import {GraphLink, GraphNode} from './models';

@Injectable({
  providedIn: 'root'
})
export class NgxProcessGraphService {
  private svg: any;
  private width = 800;
  private height = 600;

  constructor() {}

  initializeGraph(container: HTMLElement, nodes: GraphNode[], links: GraphLink[]) {
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => (d as GraphNode).id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('collide', d3.forceCollide(50)) // Prevents overlap
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));

    // Draw links
    const link = this.svg.selectAll('.link')
      .data(links)
      .enter()
      .append('path') // Change from line to path for self-loops
      .attr('class', 'link')
      .style('stroke', '#999')
      .style('stroke-width', 2)
      .attr('fill', 'none');

    // Draw arrowheads for directed edges
    this.svg.append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .style('fill', '#999');

    link.attr('marker-end', 'url(#arrow)'); // Attach arrowhead

    // Draw nodes with Angular components
    const node = this.svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('foreignObject')
      .attr('width', 100)
      .attr('height', 100)
      .attr('class', 'node')
      .html((d: any) => `<app-${d.component} id="node-${d.id}"></app-${d.component}>`);

    // Update node & link positions
    simulation.on('tick', () => {
      link.attr('d', (d: any) => this.linkPath(d)); // Adjusted for self-loops
      node.attr('x', (d: { x: number; }) => d.x - 50).attr('y', (d: { y: number; }) => d.y - 50);
    });
  }

  private linkPath(d: any) {
    if (d.source.id === d.target.id) {
      // Self-loop: Draw a curve
      const x = d.source.x, y = d.source.y;
      return `M${x},${y} C${x - 30},${y - 50} ${x + 30},${y - 50} ${x},${y}`;
    }
    return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
  }
}
