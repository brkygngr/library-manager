interface GetUserBookResponse {
  name: string;
  userScore: number;
}

interface GetUserBooksResponse {
  past: GetUserBookResponse[];
  present: Omit<GetUserBookResponse, 'userScore'>[];
}

export interface GetUserResponse {
  id: number;
  name: string;
  books: GetUserBooksResponse;
}
