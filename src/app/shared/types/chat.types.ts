export interface ChatThread {
  _id: string;
  Status: 'open' | 'closed';
  CreatedAt: string;
  UpdatedAt: string;
  Product: {
    _id: string;
    ProductName: string;
    Price: number;
    PrimaryImage?: string;
    Description?: { Title?: string; Content?: string };
  };
  Buyer: {
    _id: string;
    email: string;
  };
  Seller: {
    _id: string;
    email: string;
  };
  // local-only
  unreadCount?: number;
}

export interface ChatMessage {
  _id: string;
  ThreadID: string;
  SenderID: string;
  SenderRole: 'buyer' | 'seller';
  Text: string;
  IsRead: boolean;
  CreatedAt: string;
}
