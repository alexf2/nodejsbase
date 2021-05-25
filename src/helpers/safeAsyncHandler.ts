import {NextFunction, Handler, Request, Response, Router} from 'express';
import {ValidatedRequest, ValidatedRequestSchema} from 'express-joi-validation';

type AsyncExpressHandler = <T extends ValidatedRequestSchema>(req: ValidatedRequest<T>, res: Response, next: NextFunction) => Promise<any>;

export const safeAsyncHandler = <T extends ValidatedRequestSchema>(callback: AsyncExpressHandler) =>
    async (req: ValidatedRequest<T>, res: Response, next: NextFunction) => callback(req, res, next).catch(next);

