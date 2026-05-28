import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  // Heading text, e.g. "No Cart Items Found".
  @Input() message = 'No Items Found';
  // Optional CTA. When both are set, a primary button is rendered.
  @Input() actionLabel?: string;
  @Input() actionLink?: string | any[];
  @Output() actionClick = new EventEmitter<void>();
}
