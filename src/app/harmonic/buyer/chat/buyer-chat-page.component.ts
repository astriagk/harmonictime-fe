import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/shared/services/chat.service';
import { ChatThread } from 'src/app/shared/types/chat.types';
import { selectUserData } from 'src/app/store/selectors/user.selectors';

@Component({
  selector: 'app-buyer-chat-page',
  templateUrl: './buyer-chat-page.component.html',
  styleUrls: ['./buyer-chat-page.component.scss'],
})
export class BuyerChatPageComponent implements OnInit, OnDestroy {
  threads: ChatThread[] = [];
  selectedThread: ChatThread | null = null;
  buyerId = '';
  loading = false;
  mobileShowChat = false;

  private storeSub?: Subscription;

  constructor(
    private chatService: ChatService,
    private store: Store,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.storeSub = this.store.select(selectUserData).subscribe((state) => {
      this.buyerId = state?.user?.data?._id ?? '';
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
    this.chatService.getThreads('buyer').subscribe({
      next: (threads) => {
        this.threads = threads;
        this.loading = false;
        // auto-select thread if productId query param is present
        const productId = this.route.snapshot.queryParamMap.get('productId');
        if (productId) {
          this.openThreadForProduct(productId);
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private openThreadForProduct(productId: string): void {
    // check if thread already exists in the list
    const existing = this.threads.find((t) => t.Product?._id === productId);
    if (existing) {
      this.selectThread(existing);
      return;
    }
    // otherwise create it
    this.chatService.createOrGetThread(productId).subscribe({
      next: (thread) => {
        if (!this.threads.find((t) => t._id === thread._id)) {
          this.threads = [thread, ...this.threads];
        }
        this.selectThread(thread);
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
