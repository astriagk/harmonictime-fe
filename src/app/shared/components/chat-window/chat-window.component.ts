import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ChatMessage } from '../../types/chat.types';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
})
export class ChatWindowComponent implements OnInit, OnChanges, OnDestroy {
  @Input() threadId!: string;
  @Input() currentUserId!: string;
  @Input() isClosed = false;

  @ViewChild('scrollContainer') scrollContainerRef?: ElementRef<HTMLElement>;

  private messages = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messages.asObservable();

  draftText = '';
  isLoading = false;

  private msgSub?: Subscription;
  private activeThreadId?: string;

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.msgSub = this.chatService.newMessage$.subscribe((msg) => {
      if (msg.ThreadID === this.threadId) {
        const current = this.messages.getValue();
        // deduplicate by _id
        if (!current.find((m) => m._id === msg._id)) {
          this.messages.next([...current, msg]);
          this.cdr.detectChanges();
          this.scrollToBottom();
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['threadId'] && this.threadId) {
      if (this.activeThreadId) {
        this.chatService.leaveThread(this.activeThreadId);
      }
      this.activeThreadId = this.threadId;
      this.messages.next([]);
      this.loadMessages();
    }
  }

  ngOnDestroy(): void {
    this.msgSub?.unsubscribe();
    if (this.activeThreadId) {
      this.chatService.leaveThread(this.activeThreadId);
    }
  }

  private loadMessages(): void {
    this.isLoading = true;
    this.chatService.getMessages(this.threadId).subscribe({
      next: (msgs) => {
        this.messages.next(msgs);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
        this.chatService.joinThread(this.threadId);
      },
      error: () => {
        this.isLoading = false;
        this.chatService.joinThread(this.threadId);
      },
    });
  }

  send(): void {
    const text = this.draftText.trim();
    if (!text || this.isClosed) return;
    this.draftText = '';

    if (this.chatService.isSocketAvailable) {
      this.chatService.sendMessageSocket(this.threadId, text);
    } else {
      this.chatService.sendMessageRest(this.threadId, text).subscribe({
        next: (msg) => {
          const current = this.messages.getValue();
          if (!current.find((m) => m._id === msg._id)) {
            this.messages.next([...current, msg]);
            this.cdr.detectChanges();
            this.scrollToBottom();
          }
        },
      });
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollContainerRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }
}
