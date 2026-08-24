export interface ILoginRequest {
  phone: string;
  name: string;
}

export interface IJwtPayload {
  userId: string;
}