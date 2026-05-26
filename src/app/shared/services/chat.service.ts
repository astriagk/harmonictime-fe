import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from '@env/environment';
import { GenericService } from './generic.service';
import {
  CHAT_THREADS,
  CHAT_THREAD_MSG,
  CHAT_CLOSE_THREAD,
} from '@config/index';
import { ChatMessage, ChatThread } from '../types/chat.types';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket | null = null;
  isSocketAvailable = false;

  private _newMessage$ = new Subject<ChatMessage>();
  private _socketError$ = new Subject<{ message: string }>();

  newMessage$: Observable<ChatMessage> = this._newMessage$.asObservable();
  socketError$: Observable<{ message: string }> =
    this._socketError$.asObservable();

  constructor(private genericService: GenericService) {}

  connect(): void {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('token');
    const parsedToken = token ? JSON.parse(token) : '';

    this.socket = io(environment.socketBaseUrl, {
      path: '/socket.io',
      auth: { token: parsedToken },
    });

    this.socket.on('connect', () => {
      this.isSocketAvailable = true;
    });

    this.socket.on('connect_error', () => {
      this.isSocketAvailable = false;
    });

    this.socket.on('new_message', (msg: ChatMessage) => {
      this._newMessage$.next(msg);
    });

    this.socket.on('error', (err: { message: string }) => {
      this._socketError$.next(err);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isSocketAvailable = false;
    }
  }

  joinThread(threadId: string): void {
    this.socket?.emit('join_thread', threadId);
  }

  leaveThread(threadId: string): void {
    this.socket?.emit('leave_thread', threadId);
  }

  sendMessageSocket(threadId: string, text: string): void {
    this.socket?.emit('send_message', { threadId, text });
  }

  // REST API methods

  createOrGetThread(productId: string): Observable<ChatThread> {
    return this.genericService
      .postObservableToken(CHAT_THREADS, { productId })
      .pipe(map((res: any) => res.data));
  }

  getThreads(role: 'buyer' | 'seller'): Observable<ChatThread[]> {
    return this.genericService
      .getObservableToken(`${CHAT_THREADS}?role=${role}`)
      .pipe(map((res: any) => res.data));
  }

  getMessages(threadId: string): Observable<ChatMessage[]> {
    return this.genericService
      .getObservableToken(CHAT_THREAD_MSG(threadId))
      .pipe(map((res: any) => res.data));
  }

  sendMessageRest(threadId: string, text: string): Observable<ChatMessage> {
    return this.genericService
      .postObservableToken(CHAT_THREAD_MSG(threadId), { text })
      .pipe(map((res: any) => res.data));
  }

  closeThread(threadId: string): Observable<void> {
    return this.genericService
      .patchObservableToken(CHAT_CLOSE_THREAD(threadId), {})
      .pipe(map(() => void 0));
  }
}
