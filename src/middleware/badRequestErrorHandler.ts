import {Request, Response, NextFunction} from 'express';
import {getCodeByError, addRequestId, Logger} from '../helpers';

export const getBadRequestErrorHandler = (logger: Logger) => (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err) {
        const code = err.code || getCodeByError(err);
        const {name} = err;

        logger.error(err.message || name, {meta: addRequestId(res, {name, code}), stack: err.stack});
        res.status(code).json({name, message: err.message});
    } else {
        next(err);
    }
}
