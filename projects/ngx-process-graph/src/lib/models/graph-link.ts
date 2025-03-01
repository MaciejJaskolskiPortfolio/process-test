export interface GraphLink {
  source: string;
  target: string;
  type: GraphLinkType;
  color?: string;
}

export const DEFAULT_LINK_COLOR = '#999';

export type GraphLinkType = 'normal' | 'top' | 'bottom';
