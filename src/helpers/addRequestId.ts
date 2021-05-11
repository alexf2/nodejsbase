import {Request} from 'express';
import {Config} from './Config';

export const addRequestId = (req: Request, meta?: Record<string, unknown>) => {
    const {user} = req as any;

    return {
        ...meta,
        [Config.reqIdHeader]: req[Config.reqIdHeader],
        ...(user && {user: {id: user.id, login: user.login}}),
    };
}

export const getRequestIdMeta = (req: Request) => ({
    meta: addRequestId(req),
});
