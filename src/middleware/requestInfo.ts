import {Request, Response, NextFunction} from 'express';
import {Logger} from '../helpers';

const getParamsStr = (paramsObj: object) => {
    const pairs = Object.keys(paramsObj || {}).map(key => `${key}=[${paramsObj[key]}]`);
    return pairs.join(', ');
}

/**
 * Представляет Middleware, который логирует все вызовы REST-эндпоинтов: имя и аргументы.
 * Должен устанавливаться на Application в начало цепочки.
 */
export const getRequestInfo = (logger: Logger) => (req: Request, res: Response, next: NextFunction) => {
    const bodyParams = getParamsStr(req.body);
    
    logger.info(`${req.method}: [${req.url}] ${bodyParams && 'with body ' || ''}${bodyParams}`);
    next();
};
