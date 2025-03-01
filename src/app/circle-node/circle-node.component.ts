import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-circle-node',
  template: `<div class="circle-node">{{label || ''}}</div>`,
  styles: [`
    .circle-node {
      width: 80px;
      height: 80px;
      background: lightblue;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      text-align: center;
    }
  `]
})
export class CircleNodeComponent {
  @Input() label!: string
}
