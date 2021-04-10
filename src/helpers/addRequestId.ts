import {Response} from 'express';
import {Config} from './Config';

export const addRequestId = (response: Response, meta?: Record<string, unknown>) => ({
    ...meta,
    [Config.reqIdHeader]: response.getHeader(Config.reqIdHeader),
});

export const getRequestIdMeta = (response: Response) => ({
    meta: addRequestId(response),
});
