import AuthenticateService from '@services/AuthenticateService';
import { Request, Response, NextFunction } from 'express';

class AuthenticateController {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, senha } = req.body;
      const result = await AuthenticateService.authenticate(email, senha);
      return res.status(204).setHeader('token', result).end();
    } catch (e) {
      return next(e);
    }
  }
}

export default new AuthenticateController();
