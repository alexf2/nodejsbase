import * as Joi from 'joi'
import {
    ContainerTypes,
    ValidatedRequestSchema,
    createValidator,
} from 'express-joi-validation';

export const authControllerValidator = createValidator({
    passError: true, // отправлять ошибку валидации в next(err), чтобы попала в catchError на руте контроллера
});


export const bodyLogin = Joi.object({
    login: Joi.string().required(),
    password: Joi.string().required(),
});
export interface LoginBodySchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        login: string;
        password: string;
    }
}
