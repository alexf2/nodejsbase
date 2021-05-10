import {ErrorRequestHandler} from 'express';
import {ExpressJoiError} from 'express-joi-validation';
import {Logger, CustomError, addRequestId} from '../helpers';

/**
 * Middleware, представляющее обработчик ошибок для контроллеров. Должно устанавливаться в цепочку
 * на рутовй Url контроллера после методов контроллера.
 */
export const catchError = (logger: Logger): ErrorRequestHandler => (err, req, res, next) => {
    let httpError;
    let logError;

    if (!err) {
        next();
        return;
    }

    if (err.error && err.error.isJoi) { // ошибка валидатора request
        const e = err as ExpressJoiError;
        const {error} = e;
        httpError = {
            code: 400,
            name: 'ValidationError',
            message: `Bad '${e.type}' parameter: ${error!.message}`,
            data: e.value,
        };
        logError = {
            code: 400,
            name: 'ValidationError',
            message: `Bad '${e.type}' parameter: ${error!.message}`,
            data: e.value,
            stack: error!.stack,
        };
    } else if (err instanceof CustomError) {
        httpError = err.mapToHttpResponse();
        logError = err.mapToServerLog();
    } else if (err instanceof Error) {
        httpError = {
            code: 500,
            name: `GeneralInternalServerError: ${err.name}`,
            message: 'Internal server error', // Мод. 5.2: скрытие внутренних ошибок
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
            message: err.message || typeof err.toString === 'function' && err.toString(),
        };
        logError = httpError;
    }

    const {code, ...rest} = httpError;
    res.status(code).json({...rest});

    const {message, stack, ...restLog} = logError;
    logger.error(message || logError.name, {meta: addRequestId(res, {...restLog}), stack});
};
