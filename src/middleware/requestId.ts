import {RequestHandler} from 'express';
import {v4 as uuidv4} from 'uuid';
import {Config} from '../helpers';

/**
 * Представляет Middleware добавляющее уникальный id запроса, который должен добавляться в логи и отправляться 
 * клиенту. id используется для поиска в логах всех событий по одному конкретному запросу.
 * Должен устанавливаться на Application в начало цепочки.
 */
export const requestId: RequestHandler = (req, res, next) => {
    const reqId = uuidv4();
    req[Config.reqIdHeader] = reqId;
    res.setHeader(Config.reqIdHeader, reqId);

    next();
};
