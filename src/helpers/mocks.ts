import {mocked} from 'ts-jest/utils';
import {Response} from 'express';
import {IUserService, IGroupService} from '../services';
import {Logger} from './loggers';

export const errorMsg = 'Generic error';

export const loggerMock = mocked<Logger>(new (jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    silly: jest.fn(),
} as any))), true);

export const userServiceMock = mocked<IUserService>(new (jest.fn(() => ({
    getAllUsers: jest.fn(),
    countUsers: jest.fn(),
    getUserById: jest.fn(),
    getUserByLogin: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    findUserByLogin: jest.fn(),
    updateUser: jest.fn(),
} as any))), true);

export const groupServiceMock = mocked<IGroupService>(new (jest.fn(() => ({
    getAllGroups: jest.fn(),
    countGroups: jest.fn(),
    getGroupById: jest.fn(),
    createGroup: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
    addUsersToGroup: jest.fn(),
} as any))), true);

export const getResponseMock = () => {
    const res = {} as Response;

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);

    return res;
};

export const nextMock = jest.fn();
