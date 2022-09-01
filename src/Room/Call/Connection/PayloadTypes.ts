export interface User {
  id: string;
  nickname: string;
}

export interface RegisterPayload {
  // not always received. For example, when reconnecting inside the allowed period, the old userId remains in use
  userId?: string;
  roomParticipants: User[];
}
