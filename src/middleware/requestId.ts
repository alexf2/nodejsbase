import {RequestHandler} from 'express';
import {v4 as uuidv4} from 'uuid';
import {Config} from '../helpers';

export const requestId: RequestHandler = (req, res, next) => {
    const reqId = uuidv4();
    req[Config.reqIdHeader] = reqId;
    res.setHeader(Config.reqIdHeader, reqId);

    next();
};
