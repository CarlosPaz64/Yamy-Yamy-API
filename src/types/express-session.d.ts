import { Request } from 'express';
import { Session, SessionData } from 'express-session';

interface CustomSession extends SessionData {
  token?: string;
  userId?: number;
}

export interface CustomSessionRequest extends Request {
  session: Session & CustomSession;
}
