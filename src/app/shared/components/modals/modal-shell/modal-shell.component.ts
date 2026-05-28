import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-shell',
  templateUrl: './modal-shell.component.html',
})
export class ModalShellComponent {
  @Input() title = '';
  @Input() size: 'default' | 'lg' | 'xl' = 'default';
  /** Increase for stacked modals (e.g. 1065 when a second modal sits on top). */
  @Input() zIndex = 1055;
  @Output() closed = new EventEmitter<void>();

  get backdropZIndex(): number {
    return this.zIndex - 1;
  }
}
