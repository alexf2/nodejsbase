import * as Joi from 'joi'
import {Permission} from '@prisma/client'
import {
    ContainerTypes,
    ValidatedRequestSchema,
    createValidator,
} from 'express-joi-validation';

export const groupControllerValidator = createValidator({
    passError: true, // отправлять ошибку валидации в next(err), чтобы попала в catchError на руте контроллера
});

export const bodyCreateGroup = Joi.object({
    name: Joi.string().required(),
    permissions: Joi.array().items(Joi.string().valid(...Object.values(Permission))),
    
});
export interface CreateGroupBodySchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        name: string;
        permissions: Permission[];
    }
}
export interface UpdateGroupBodySchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        name: string;
        permissions?: Permission[];
    }
    [ContainerTypes.Params]: {
        id: string;
    }
}
export const bodyAddUsersToGroup = Joi.array().items(Joi.string().uuid()).required();

export interface AddUsersToGroupBodySchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: string[],
    [ContainerTypes.Params]: {
        id: string;
    }
}

