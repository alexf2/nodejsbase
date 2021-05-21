import {Request, Response, NextFunction} from 'express';
import {getCodeByError, addRequestId, Logger} from '../helpers';

export const getUnhandledErrorHandler = (logger: Logger) => (err: any) => {
    if (err) {
        const code = err.code || getCodeByError(err);
        const {name} = err;

        logger.error(`Unhandled exception: ${err.message || name}`, {code, stack: err.stack});
        process.exit(-1);
    }
}

export const getUnhandledRejectionHandler = (logger: Logger) => (err: any, promise: any) => {
    const code = err.code || getCodeByError(err);
    const {name} = err;

    logger.error(`Promise rejection: ${err.message || name}`, {code, stack: err.stack});
    process.exit(-1);
}

/**
 * Мод. 5.2: общий серверный обработчик ошибок
 */
export const getBadRequestErrorHandler = (logger: Logger) => (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err) {
        const code = err.code || getCodeByError(err);
        const {name} = err;

        logger.error(err.message || name, {meta: addRequestId(req, {name, code}), stack: err.stack});
        res.status(code).json({
            name,
            message: code === 500 ? 'Internal server error. Use reqIdHeader header to investigate error details in server logs.' : err.message,
        });
    } else {
        next(err);
    }
}
