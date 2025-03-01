import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Input,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {DEFAULT_LINK_COLOR, GraphLink, GraphNode} from "./models";
import {NgxProcessGraphService} from "./ngx-process-graph.service";
import * as d3 from 'd3';


@Component({
  selector: 'lib-ngx-process-graph',
  template: `
    <div #graphContainer class="graph-container">
      <svg #svgContainer class="graph-svg"></svg>
      <div #nodeContainer class="node-container"></div>
    </div>
  `,
  styles: [
    `
      .graph-container {
        position: relative;
        width: 800px;
        height: 600px;
        border: 1px solid #ddd;
      }

      .graph-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .node-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none; /* Allows interaction with SVG while placing nodes above */
      }`
  ]
})
export class NgxProcessGraphComponent implements AfterViewInit {
  @Input() nodes: GraphNode[] = [];
  @Input() links: GraphLink[] = [];

  @ViewChild('graphContainer', { static: true }) graphContainer!: ElementRef;
  @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef;
  @ViewChild('nodeContainer', { read: ViewContainerRef, static: true }) nodeContainer!: ViewContainerRef;

  private width = 800;
  private height = 400;
  private nodeSpacing = 150; // Adjust spacing between nodes
  private simulation: any;

  markers = [{ color: 'red' }]

  constructor(private resolver: ComponentFactoryResolver) {}

  ngAfterViewInit() {
    this.initializeGraph();
  }

  private initializeGraph() {
    const svg = d3.select(this.svgContainer.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height);

    const defs = svg.append('defs'); // Define arrow markers
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)  // Position at the end of the line
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
      .attr('fill', '#999')

    const linkGroup = svg.append('g').attr('class', 'links');
    const nodeElements: { [id: string]: any } = {};

    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id(d => (d as GraphNode).id).distance(this.nodeSpacing))
      .force('charge', d3.forceManyBody().strength(0)) // Disable movement
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .on('tick', () => this.ticked(linkGroup, nodeElements));

    // Draw links
    const link = linkGroup.selectAll('.link')
      .data(this.links)
      .enter()
      .append('path') // Use path for right-angled links
      .attr('class', 'link')
      .style('stroke', (d: any) => d.color || DEFAULT_LINK_COLOR)
      .style('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrowhead)'); // Add arrowhead at the end of each link

    // Create Angular components dynamically for nodes
    this.nodes.forEach(node => {
      const componentFactory = this.resolver.resolveComponentFactory(node.component);
      const componentRef = this.nodeContainer.createComponent(componentFactory);
      componentRef.instance.label = `Node ${node.id}`;
      nodeElements[node.id] = componentRef.location.nativeElement;

      // Set initial styles
      Object.assign(nodeElements[node.id].style, {
        position: 'absolute',
        width: '80px',
        height: '80px',
        textAlign: 'center',
        transition: 'transform 0.3s',
      });
    });

    this.simulation.alpha(1).restart(); // Restart to apply new positions
  }

  private ticked(linkGroup: any, nodeElements: { [id: string]: any }) {
    linkGroup.selectAll('.link')
      .attr('d', (d: any) => this.getLinkPath(d))

    // Position Angular nodes absolutely over the SVG
    this.nodes.forEach(node => {
      const element = nodeElements[node.id];
      if (element) {
        element.style.transform = `translate(${node.fx - 40}px, ${node.fy - 40}px)`;
      }
    });
  }

  private getLinkPath(d: any) {
    const { source, target } = d;
    if (!source || !target) return '';

    const nodeWidth = 80; // Approximate node size
    const shiftX = nodeWidth / 2; // Shift to ensure links attach properly
    const verticalGap = 60; // Space below/above nodes before turning

    // For normal links, shift horizontally to avoid overlap
    if (d.type === 'normal') {
      return `M${source.fx + shiftX},${source.fy} L${target.fx - shiftX},${target.fy}`;
    }

    // Bottom link: Start from the bottom of the source node, go down, then horizontal, and back up to the target
    if (d.type === 'bottom') {
      return `
      M${source.fx},${source.fy + shiftX}
      L${source.fx},${source.fy + verticalGap}
      L${target.fx},${source.fy + verticalGap}
      L${target.fx},${target.fy + shiftX}
    `;
    }

    // Top link: Start from the top of the source node, go up, then horizontal, and back down to the target
    if (d.type === 'top') {
      return `
      M${source.fx},${source.fy - shiftX}
      L${source.fx},${source.fy - verticalGap}
      L${target.fx},${source.fy - verticalGap}
      L${target.fx},${target.fy - shiftX}
    `;
    }

    // Fallback for generic links
    return `M${source.fx},${source.fy} L${target.fx},${target.fy}`;
  }

}
