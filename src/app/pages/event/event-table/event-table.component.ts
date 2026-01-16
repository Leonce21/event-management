import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';

import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { TableDropdownComponent } from '../../../shared/components/common/table-dropdown/table-dropdown.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';

import { environment } from '../../../../environments/environment.development';


interface Event {
  id: number;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  isOnline: boolean;
  capacity?: number;
}

@Component({
  selector: 'app-event-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    BadgeComponent,
    TableDropdownComponent,
    ModalComponent
  ],
  templateUrl: './event-table.component.html',
})
export class EventTableComponent implements OnInit {
  // raw data & pagination
  events: Event[] = [];
  pages: number[] = [];
  currentPage = 1;
  limit = 10; // controlled by "Show # entries"
  totalPages = 1;
  loading = false;

  // search
  searchQuery = '';

  // add/edit form state
  formError: string | null = null;
  isSubmitting = false;
  isModalOpen = false;
  selectedEvent: Event | null = null;
  eventTitle = '';
  eventDescription = '';
  eventLocation = '';
  eventStartDate = ''; // datetime-local formatted string
  eventEndDate = '';
  eventIsOnline = false;
  eventCapacity: number | null = null;

  // details modal (read-only)
  isDetailsOpen = false;
  detailsEvent: Event | null = null;

  // delete confirm modal
  isConfirmOpen = false;
  eventToDelete: Event | null = null;
  isDeleting = false;
  deleteError: string | null = null;

  private readonly API = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchEvents();
  }

  // compute filtered list (searchable)
  filteredEvents(): Event[] {
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return this.events;
    return this.events.filter(e =>
      (e.title || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q) ||
      (e.location || '').toLowerCase().includes(q)
    );
  }

  // ----- fetch / pagination -----
  fetchEvents() {
    this.loading = true;
    // include q param only when there is a query
    const qPart = this.searchQuery?.trim() ? `&search=${encodeURIComponent(this.searchQuery.trim())}` : '';
    const url = `${this.API}?page=${this.currentPage}&limit=${this.limit}${qPart}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        const dataArray = res?.data?.data ?? [];
        const meta = res?.data?.meta ?? {};
        this.events = Array.isArray(dataArray) ? [...dataArray] : [];
        this.totalPages = Number(meta.totalPages) || 1;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching events:', err);
        this.loading = false;
      },
    });
  }

  // invoked from the template when the search input changes
  onSearchChange(value: string) {
    this.searchQuery = value;
    this.currentPage = 1; // reset to first page on new search
    this.fetchEvents();
  }


  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchEvents();
  }

  // change page size
  onLimitChange(newLimit: number) {
    this.limit = newLimit;
    this.currentPage = 1;
    this.fetchEvents();
  }

  // ----- add/edit modal -----
  openModalForAdd() {
    this.resetModalFields();
    this.selectedEvent = null;
    this.openModal();
  }

  private toDateTimeLocal(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  openModalForEdit(event: Event) {
    this.selectedEvent = event;
    this.eventTitle = event.title;
    this.eventDescription = event.description ?? '';
    this.eventLocation = event.location ?? '';
    this.eventStartDate = this.toDateTimeLocal(event.startDate);
    this.eventEndDate = this.toDateTimeLocal(event.endDate);
    this.eventIsOnline = !!event.isOnline;
    this.eventCapacity = event.capacity ?? null;
    this.openModal();
  }

  openModal() {
    this.isModalOpen = true;
    this.formError = null;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetModalFields();
  }

  resetModalFields() {
    this.eventTitle = '';
    this.eventDescription = '';
    this.eventLocation = '';
    this.eventStartDate = '';
    this.eventEndDate = '';
    this.eventIsOnline = false;
    this.eventCapacity = null;
    this.selectedEvent = null;
    this.formError = null;
  }

  // ----- details modal (read only) -----
  openDetails(event: Event) {
    this.detailsEvent = event;
    this.isDetailsOpen = true;
  }

  closeDetails() {
    this.isDetailsOpen = false;
    this.detailsEvent = null;
  }

  isDateRangeValid(): boolean {
    if (!this.eventStartDate || !this.eventEndDate) return true;
    const start = new Date(this.eventStartDate);
    const end = new Date(this.eventEndDate);
    return end.getTime() > start.getTime();
  }

  getDateRangeError(): string | null {
    if (!this.eventStartDate || !this.eventEndDate) return null;
    if (!this.isDateRangeValid()) return 'End date must be after start date.';
    return null;
  }

  // ----- create/update -----
  handleAddOrUpdateEvent(form: NgForm) {
    this.formError = null;

    if (form && form.controls) {
      Object.values(form.controls).forEach(ctrl => ctrl.markAsTouched());
    }

    if (!form || form.invalid) {
      this.formError = 'Please fix the highlighted fields.';
      return;
    }

    if (!this.isDateRangeValid()) {
      this.formError = this.getDateRangeError();
      return;
    }

    this.isSubmitting = true;

    const payload: any = {
      title: this.eventTitle,
      description: this.eventDescription,
      location: this.eventLocation,
      startDate: new Date(this.eventStartDate).toISOString(),
      endDate: new Date(this.eventEndDate).toISOString(),
      isOnline: !!this.eventIsOnline,
      capacity: this.eventCapacity != null ? Number(this.eventCapacity) : null,
    };

    // update (PUT) when editing
    if (this.selectedEvent && this.selectedEvent.id) {
      const id = this.selectedEvent.id;
      this.http.put<any>(`${this.API}/${id}`, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.fetchEvents();
          this.closeModal();
        },
        error: (err) => {
          console.error('Update event failed', err);
          this.isSubmitting = false;
          this.formError = err?.error?.message ?? 'Failed to update event. Please try again.';
        }
      });
      return;
    }

    // create (POST)
    this.http.post<any>(this.API, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.fetchEvents();
        this.closeModal();
      },
      error: (err) => {
        console.error('Add event failed', err);
        this.isSubmitting = false;
        this.formError = err?.error?.message ?? 'Failed to add event. Please try again.';
      }
    });
  }

  // ----- dropdown actions -----
  handleViewMore(event: Event) {
    // open details (read-only)
    this.openDetails(event);
  }

  promptDelete(event: Event) {
    this.eventToDelete = event;
    this.deleteError = null;
    this.isConfirmOpen = true;
  }

  cancelDelete() {
    this.isConfirmOpen = false;
    this.eventToDelete = null;
    this.deleteError = null;
  }

  confirmDelete() {
    if (!this.eventToDelete) return;
    this.isDeleting = true;
    this.deleteError = null;
    this.http.delete<any>(`${this.API}/${this.eventToDelete.id}`).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isConfirmOpen = false;
        this.eventToDelete = null;
        this.fetchEvents();
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.isDeleting = false;
        this.deleteError = err?.error?.message ?? 'Failed to delete event. Please try again.';
      }
    });
  }

  getBadgeColor(isOnline: boolean): 'success' | 'warning' {
    return isOnline ? 'success' : 'warning';
  }

  trackById(index: number, item: Event): number {
    return item.id;
  }
}
