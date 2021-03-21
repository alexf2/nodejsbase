import {ErrorRequestHandler} from 'express';
import {Logger, CustomError, addRequestId} from '../helpers';

export const catchError = (logger: Logger): ErrorRequestHandler => (err, req, res, next) => {
    let httpError;
    let logError;

    if (err instanceof CustomError) {
        httpError = err.mapToHttpResponse();
        logError = err.mapToServerLog();
    } else if (err instanceof Error) {
        httpError = {
            code: 500,
            name: `GeneralInternalServerError: ${err.name}`,
            message: err.message,
        };
        logError = {
            code: 500,
            name: `GeneralInternalServerError: ${err.name}`,
            message: err.message,
            stack: err.stack,

        };
    } else {
        httpError = {
            code: 500,
            name: 'UnknownError',
            message: err && typeof err.toString === 'function' && err.toString(),
        };
        logError = httpError;
    }

    const {code, ...rest} = httpError;
    res.status(code).json({...rest});

    const {message, stack, ...restLog} = logError;
    logger.error(message || logError.name, {meta: addRequestId(res, {...restLog}), stack});
};
