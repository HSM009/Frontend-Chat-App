export type Conversation = {
  id: string;
  name: string | null;
  imageUrl: string | null;
  isGroup: boolean;

  unreadCount: number;

  message: {
    id: string;
    text: string;
    createdAt: string;
    senderId: string;
    type: string;
  } | null;

  participants: {
    user: {
      id: string;
      name: string;
      phone: string;
      isOnline: boolean;
    };
  }[];
};
