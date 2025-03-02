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

    const defs = svg.append('defs');
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
      .attr('fill', '#999');

    const linkGroup = svg.append('g').attr('class', 'links');
    const nodeElements: { [id: string]: any } = {};

    // Create midpoint nodes dynamically
    this.processMidpointNodes();

    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id(d => (d as GraphNode).id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .on('tick', () => this.ticked(linkGroup, nodeElements));

    // Draw links
    const link = linkGroup.selectAll('.links')
      .data(this.links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .style('stroke', (d: any) => d.color || DEFAULT_LINK_COLOR)
      .style('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', d => this.shouldHaveArrow(d) ? 'url(#arrowhead)' : ''); // Apply arrow selectively

    this.links.forEach((link) => {
      if (link.text) {
        svg.append('text')
          .attr('class', 'link-label')
          .data([link])
          .attr("dy", (d: any) => {
            if (d.type === 'normal') {
              return '20'
            }
            return d.type === 'bottom' ? 20 : -20;
          })
          .attr('x', (d: any) => {
            return (d.source.fx + d.target.fx) / 2
          })
          .attr('y', (d: any) => {
            const midPoint = (d.source.fy + d.target.fy) / 2;
            if (d.type === 'normal') {
              return midPoint
            }
            const shift = d.type === 'bottom' ? 60 : -60;
            return midPoint + shift;
          })
          .text(function(d: any) {
            return d.text || ''
          });
      }
    })

    // Create Angular components dynamically for nodes
    this.nodes.forEach(node => {
      if (!node.component) return
      const componentFactory = this.resolver.resolveComponentFactory(node.component);
      const componentRef = this.nodeContainer.createComponent(componentFactory);
      componentRef.instance.label = `Node ${node.id}`;
      nodeElements[node.id] = componentRef.location.nativeElement;

      Object.assign(nodeElements[node.id].style, {
        position: 'absolute',
        width: '80px',
        height: '80px',
        textAlign: 'center',
        transition: 'transform 0.3s',
        pointerEvents: 'none',
      });
    });

    this.simulation.alpha(1).restart();
  }

  private shouldHaveArrow(link: any): boolean {
    // If the source is a midpoint node (M1, M2, etc.), don't add an arrowhead
    console.log(link)
    return !link.target.id.startsWith('M')
  }

  private ticked(linkGroup: any, nodeElements: any) {
    linkGroup.selectAll('.link')
      .attr('d', (d: any) => this.getLShapedPath(d));

    Object.entries(nodeElements).forEach(([id, element]) => {
      const node = this.nodes.find(n => n.id === id);
      if (node) {
        const element = nodeElements[node.id];
        element.style.transform = `translate(${node.x! - 40}px, ${node.y! - 40}px)`;
      }
    });
  }

  private getLShapedPath(link: any) {
    const sourceX = link.source.x;
    const sourceY = link.source.y;
    const targetX = link.target.x;
    const targetY = link.target.y;

    const isMidpointNode = link.target.id.startsWith('M');

    if (isMidpointNode && link.type === 'midpoint') {
      // Determine if the link should go UP or DOWN
      const isGoingDown = targetY > sourceY;

      // Offsets
      const verticalOffset = isGoingDown ? 40 : -40; // Move down 40px or up 40px
      const midX = sourceX + (targetX - sourceX); // Halfway horizontally
      const midY = sourceY + verticalOffset; // Move first in Y direction

      return `M ${sourceX},${sourceY}
          L ${midX},${sourceY}
          L ${midX},${targetY}`;
    } else {
      // Default straight link for normal connections
      return this.getLinkPath(link)
    }
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
    return `M${source.fx - 40},${source.fy} L${target.fx - 40},${target.fy}`;
  }

  private processMidpointNodes() {
    const newNodes: GraphNode[] = [];
    const newLinks: GraphLink[] = [];

    this.links.forEach(link => {
      if (link.midpointNodeId) {
        // Compute midpoint coordinates
        const sourceNode = this.nodes.find(n => n.id === link.source);
        const targetNode = this.nodes.find(n => n.id === link.target);
        if (!sourceNode || !targetNode) return;

        const midX = (sourceNode.fx + targetNode.fx) / 2;
        const midY = (sourceNode.fy + targetNode.fy) / 2;

        // Create the midpoint node
        const midpointNode = { id: link.midpointNodeId, fx: midX, fy: midY };
        newNodes.push(midpointNode as GraphNode);

        // Replace the original link with two new links
        newLinks.push({ source: link.source, target: midpointNode.id } as GraphLink);
        newLinks.push({ source: midpointNode.id, target: link.target } as GraphLink);
      } else {
        newLinks.push(link);
      }
    });

    // Append new nodes and links
    this.nodes.push(...newNodes);
    this.links = newLinks;
  }

}
