import { Component, ViewChild } from '@angular/core';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { EventTableComponent } from './event-table/event-table.component';

@Component({
  selector: 'app-basic-tables',
  imports: [
    ComponentCardComponent,
    PageBreadcrumbComponent,
    EventTableComponent,
  ],
  templateUrl: './event.component.html',
  styles: ``
})
export class EventComponent {

  @ViewChild('tableComp') tableComp!: EventTableComponent;

  openAdd() {
    // delegate to the event table component to open the modal
    this.tableComp?.openModalForAdd?.();
  }
}
