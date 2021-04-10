import * as Joi from 'joi'
import {
    ContainerTypes,
    ValidatedRequestSchema,
    createValidator,
} from 'express-joi-validation';

export const userControllerValidator = createValidator({
    passError: true, // отправлять ошибку валидации в next(err), чтобы попала в catchError на руте контроллера
});


export const qsGetAllSchema = Joi.object({
    limit: Joi.number().integer().min(1).optional(),
});
export interface GetAllQuerySchema extends ValidatedRequestSchema {
    [ContainerTypes.Query]: {
        limit: number;
    }
}

export const paramGetByIdSchema = Joi.object({
    id: Joi.string().uuid().required(),
});
export interface GetByIdParamSchema extends ValidatedRequestSchema {
    [ContainerTypes.Params]: {
        id: string;
    }
}

export const bodyCreateSchema = Joi.object({
    login: Joi.string().required(),
    password: Joi.string().pattern(/^((\d+[A-Za-z]+)|([A-Za-z]+\d+))[\dA-Za-z]*$/).required(),
    age: Joi.number().integer().min(4).max(130).required(),
});
export interface CreateBodySchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        login: string;
        password: string;
        age: number;
    }
}
export interface UpdateBodySchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        login: string;
        password: string;
        age: number;
    }
    [ContainerTypes.Query]: {
        id: number;
    }
}

export const qsSuggestsSchema = Joi.object({
    login: Joi.string().required(),
    limit: Joi.number().integer().min(1).optional(),
});
export interface SuggestsSchema extends ValidatedRequestSchema {
    [ContainerTypes.Query]: {
        login: string;
        limit: number;
    }
}

// https://github.com/evanshortiss/express-joi-validation#readme
