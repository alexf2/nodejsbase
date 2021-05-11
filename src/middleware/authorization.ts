import {RequestHandler} from 'express';
import * as btoken from 'jsonwebtoken';
import {IUserService} from '../services';
import {Config, Logger} from '../helpers';
import {TOKEN_KEY} from '../controllers/const';

/**
 * Представляет middleware для авторизации запросов.
 */
export const getAuthMiddleware = (userSvc: IUserService, logger: Logger, loginPath = '/login'): RequestHandler => (req, res, next) => {
    if (req.path !== loginPath) {
        const token = req.headers['x-access-token'] as string;

        if (token) {
            btoken.verify(token, TOKEN_KEY, (err, decoded) => {
                if (err) {
                    const exc = new Error(`Request ${req[Config.reqIdHeader]} failed to authenticate authorization token x-access-token.`);
                    (exc as any).code = 403;
                    exc.name = 'Forbidden';

                    next(exc);
                } else {
                    userSvc.getUserById((decoded as any).id)
                        .then(user => {
                            // добавляем пользователя в request, чтобы он был везде доступен
                            (req as any).user = user;
                            next();
                        })
                        .catch(exc => next(exc));
                }
            });
        } else {
            const exc = new Error(`Request ${req[Config.reqIdHeader]} has no authorization token.`
                + 'It should be passed as x-access-token http-header.');
            (exc as any).code = 401;
            exc.name = 'Unauthorized';

            next(exc);
        }
    } else {
        next();
    }
};
