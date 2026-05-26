import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ChatService } from 'src/app/shared/services/chat.service';
import { ChatThread } from 'src/app/shared/types/chat.types';

@Component({
  selector: 'app-buyer-chat-modal',
  templateUrl: './buyer-chat-modal.component.html',
  styleUrls: ['./buyer-chat-modal.component.scss'],
})
export class BuyerChatModalComponent implements OnChanges {
  @Input() productId!: string;
  @Input() currentUserId!: string;
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  thread: ChatThread | null = null;
  isLoadingThread = false;
  error = '';

  constructor(private chatService: ChatService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && !this.thread) {
      this.openThread();
    }
  }

  private openThread(): void {
    this.isLoadingThread = true;
    this.error = '';
    this.chatService.connect();
    this.chatService.createOrGetThread(this.productId).subscribe({
      next: (t) => {
        this.thread = t;
        this.isLoadingThread = false;
      },
      error: () => {
        this.isLoadingThread = false;
        this.error = 'Could not start chat. Please try again.';
      },
    });
  }

  close(): void {
    this.closed.emit();
  }
}
