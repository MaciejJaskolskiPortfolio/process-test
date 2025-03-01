import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {NgxProcessGraphModule} from "../../projects/ngx-process-graph/src/lib/ngx-process-graph.module";
import { CircleNodeComponent } from './circle-node/circle-node.component';

@NgModule({
  declarations: [
    AppComponent,
    CircleNodeComponent
  ],
  imports: [
    BrowserModule,
    NgxProcessGraphModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
