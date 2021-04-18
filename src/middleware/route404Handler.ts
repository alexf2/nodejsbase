import {Request, Response, NextFunction} from 'express';

export const route404Handler = (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route '${req.url}' not found`);
    (err as any).code = 404;
    err.name = 'RouteNotFound';

    next(err);
}
