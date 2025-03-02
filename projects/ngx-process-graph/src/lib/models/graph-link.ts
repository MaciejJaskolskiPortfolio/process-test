export interface GraphLink {
  source: string;
  target: string;
  type: GraphLinkType;
  color?: string;
  text?: string
  icon?: string;
  midpointNodeId?: string;
}

export const DEFAULT_LINK_COLOR = '#999';

export type GraphLinkType = 'normal' | 'top' | 'bottom' | 'midpoint';
