import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/shared/services/chat.service';
import { ChatThread } from 'src/app/shared/types/chat.types';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-seller-chat-inbox',
  templateUrl: './seller-chat-inbox.component.html',
  styleUrls: ['./seller-chat-inbox.component.scss'],
})
export class SellerChatInboxComponent implements OnInit, OnDestroy {
  threads: ChatThread[] = [];
  selectedThread: ChatThread | null = null;
  sellerId = '';
  loading = false;
  mobileShowChat = false;

  private storeSub?: Subscription;

  constructor(private chatService: ChatService, private store: Store) {}

  ngOnInit(): void {
    this.storeSub = this.store.select(selectUserData).subscribe((state) => {
      this.sellerId = state?.user?.data?._id ?? '';
    });
    this.chatService.connect();
    this.loadThreads();
  }

  ngOnDestroy(): void {
    this.storeSub?.unsubscribe();
    this.chatService.disconnect();
  }

  private loadThreads(): void {
    this.loading = true;
    this.chatService.getThreads('seller').subscribe({
      next: (threads) => {
        this.threads = threads;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  selectThread(thread: ChatThread): void {
    this.mobileShowChat = true;
    if (this.selectedThread?._id === thread._id) return;
    this.selectedThread = thread;
    thread.unreadCount = 0;
  }

  backToList(): void {
    this.mobileShowChat = false;
  }

}
