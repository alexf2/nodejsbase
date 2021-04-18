import * as Joi from 'joi'
import {
    ContainerTypes,
    ValidatedRequestSchema,
} from 'express-joi-validation';



export const qsGetAll = Joi.object({
    limit: Joi.number().integer().min(1).optional(),
});
export interface GetAllQuerySchema extends ValidatedRequestSchema {
    [ContainerTypes.Query]: {
        limit: number;
    }
}

export const paramGetById = Joi.object({
    id: Joi.string().uuid().required(),
});
export interface GetByIdParamSchema extends ValidatedRequestSchema {
    [ContainerTypes.Params]: {
        id: string;
    }
}
