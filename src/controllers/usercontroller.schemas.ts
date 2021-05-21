import * as Joi from 'joi'
import {
    ContainerTypes,
    ValidatedRequestSchema,
    createValidator,
} from 'express-joi-validation';

export const passwordPattern = /^((\d+[A-Za-z]+)|([A-Za-z]+\d+))[\dA-Za-z]*$/;

export const userControllerValidator = createValidator({
    passError: true, // отправлять ошибку валидации в next(err), чтобы попала в catchError на руте контроллера
});


export const bodyCreateUser = Joi.object({
    login: Joi.string().required(),
    password: Joi.string().pattern(passwordPattern).required(),
    age: Joi.number().integer().min(4).max(130).required(),
});
export interface CreateUserBodySchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        login: string;
        password: string;
        age: number;
    }
}

export const bodyUpdateser = Joi.object({
    login: Joi.string().required(),
    // здесь может приходить как текст, так и hash, поэтому проверять надо в контроллере, где понятно, что пришло
    password: Joi.string().required(),
    age: Joi.number().integer().min(4).max(130).required(),
});
export interface UpdateUserBodySchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        login: string;
        password: string;
        age: number;
    }
    [ContainerTypes.Params]: {
        id: string;
    }
}

export const qsSuggestsUser = Joi.object({
    login: Joi.string().required(),
    limit: Joi.number().integer().min(1).optional(),
});
export interface SuggestsUserSchema extends ValidatedRequestSchema {
    [ContainerTypes.Query]: {
        login: string;
        limit: number;
    }
}

// https://github.com/evanshortiss/express-joi-validation#readme
