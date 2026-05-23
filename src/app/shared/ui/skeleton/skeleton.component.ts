import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type SkeletonType =
  | 'product-card'
  | 'product-detail'
  | 'list-row'
  | 'table-row'
  | 'profile-row'
  | 'blog-card'
  | 'hero'
  | 'text';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  // Shape preset to render — pick the one closest to the real content.
  @Input() type: SkeletonType = 'text';
  // How many copies of the shape to render (e.g. one per grid card / table row).
  @Input() count = 1;

  // Trivial iterable for *ngFor (we only need the index repeated `count` times).
  get items(): number[] {
    return Array.from({ length: Math.max(1, this.count) });
  }
}
