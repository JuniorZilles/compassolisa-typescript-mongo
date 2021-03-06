import { GenerateTokenContent } from '@interfaces/GenerateTokenContent';
import jwt from 'jsonwebtoken';
import auth from '../../config/config';

export const generateToken = (obj: GenerateTokenContent): string =>
  jwt.sign({ content: obj }, auth.secret as string, { expiresIn: 86400 });

export const verifyToken = (token: string): string | jwt.JwtPayload => jwt.verify(token, auth.secret as string);
