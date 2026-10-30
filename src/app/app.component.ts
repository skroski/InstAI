import { Component } from '@angular/core';
import { WorkspaceLayoutComponent } from './components/workspace-layout/workspace-layout.component';

@Component({
  selector: 'app-root',
  imports: [WorkspaceLayoutComponent],
  template: `<app-workspace-layout />`,
})
export class AppComponent {}

