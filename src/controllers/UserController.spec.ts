import {mocked} from 'ts-jest/utils';
import {Response} from 'express';
import {IUser} from 'DAL/models';
import {getTestUsers} from '../part2_testData';
import {IUserService} from '../services';
import {UserController} from './UserController';
import {Logger, NotFoundError, BadRequestError, hashPassword} from '../helpers';

const errorMsg = 'Generic error';

const loggerMock = mocked<Logger>(new (jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    silly: jest.fn(),
} as any))), true);

const userServiceMock = mocked<IUserService>(new (jest.fn(() => ({
    getAllUsers: jest.fn(),
    countUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    findUserByLogin: jest.fn(),
    updateUser: jest.fn(),
} as any))), true);

const getResponseMock = () => {
    const res = {} as Response;

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);

    return res;
};
let responseMock = getResponseMock();

const nextMock = jest.fn();

let testUsers: IUser[];
let ctrl: UserController;

beforeAll(async () => {
    testUsers = await getTestUsers();
    ctrl = new UserController(loggerMock as any, userServiceMock);
});
afterEach(() => {
    jest.resetAllMocks();
    responseMock = getResponseMock();
});
afterAll(() => jest.restoreAllMocks());

describe('getAll', () => {
    test('Получение всех пользователей', async () => {
        userServiceMock.getAllUsers.mockResolvedValue(testUsers);
        const req = {query: {}} as any;

        await ctrl.getAll(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(testUsers);
        expect(nextMock).not.toHaveBeenCalled();
    });

    test('Получение всех пользователей, когда ни одного ещё не создано', async () => {
        userServiceMock.getAllUsers.mockResolvedValue([]);
        const req = {query: {}} as any;

        await ctrl.getAll(req, responseMock, nextMock);

        expect(responseMock.status).toHaveBeenCalledWith(204);
        expect(responseMock.json).toHaveBeenCalledWith([]);
        expect(nextMock).not.toHaveBeenCalled();
    });

    test('Получение пользователей с ограничением размера возвращаемых данных', async () => {
        userServiceMock.getAllUsers.mockResolvedValue(testUsers);
        const req = {query: {limit: 3}} as any;

        await ctrl.getAll(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(testUsers);
        expect(nextMock).not.toHaveBeenCalled();
        expect(userServiceMock.getAllUsers).toHaveBeenCalledWith(3);
    });

    test('Получение всех пользователей: внутренняя ошибка сервиса', async () => {
        const err = new Error(errorMsg);
        userServiceMock.getAllUsers.mockRejectedValue(err);
        const req = {query: {}} as any;

        await ctrl.getAll(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
    });
});

describe('getCount', () => {
    test('Получение количества всех пользователей', async () => {
        userServiceMock.countUsers.mockResolvedValue(3);
        const req = {query: {}} as any;

        await ctrl.getCount(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(3);
        expect(nextMock).not.toHaveBeenCalled();
    });

    test('Получение количества всех пользователей: внутренняя ошибка сервиса', async () => {
        const err = new Error(errorMsg);
        userServiceMock.countUsers.mockRejectedValue(err);
        const req = {query: {}} as any;

        await ctrl.getCount(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
    });
});

describe('getById', () => {
    test('Получение пользователя по id', async () => {
        const user = testUsers[0];
        userServiceMock.getUserById.mockResolvedValue(user);
        const req = {params: {id: user.id}} as any;

        await ctrl.getById(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(user);
        expect(nextMock).not.toHaveBeenCalled();
        expect(userServiceMock.getUserById).toHaveBeenCalledWith(user.id);
    });

    test('Получение пользователя по несуществующему id', async () => {
        const user = testUsers[0];
        const id = user.id + 'd';
        userServiceMock.getUserById.mockResolvedValue(undefined);
        const req = {params: {id}} as any;

        await ctrl.getById(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({publicData: {id}}));
        expect(nextMock.mock.calls[0][0] instanceof NotFoundError).toBeTruthy();
        expect(userServiceMock.getUserById).toHaveBeenCalledWith(id);
    });
});

describe('create', () => {
    test('Добавление нового пользователя', async () => {
        const {id, password, ...rest} = testUsers[0];
        const rawUser = {...rest, password: 'andrey1'};
        const hashedUser = {...rest, password};
        userServiceMock.createUser.mockResolvedValue({...hashedUser, id: '37c5c90e-551d-43ab-af2e-6a424d5e6d2d'});
        const req = {body: rawUser} as any;

        await ctrl.create(req, responseMock, nextMock);

        expect(responseMock.status).toHaveBeenCalledWith(201);
        expect(responseMock.json).toHaveBeenCalledWith(expect.objectContaining(hashedUser));
        expect(responseMock.json).toHaveBeenCalledWith(expect.objectContaining({id: expect.anything()}));
        expect(nextMock).not.toHaveBeenCalled();
        expect(userServiceMock.createUser).toHaveBeenCalledWith(expect.objectContaining(hashedUser));
    });

    test('Добавление нового пользователя: внутренняя ошибка сервиса', async () => {
        const err = new Error(errorMsg);
        const {id, password, ...rest} = testUsers[0];
        const rawUser = {...rest, password: 'andrey1'};
        const hashedUser = {...rest, password};
        userServiceMock.createUser.mockRejectedValue(err);
        const req = {body: rawUser} as any;

        await ctrl.create(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
        expect(userServiceMock.createUser).toHaveBeenCalledWith(expect.objectContaining(hashedUser));
    });
});

describe('update', () => {
    test('Редактирование полей существующего юзера', async () => {
        const user = testUsers[0];
        const {id} = user;
        const updatedUser = {...user, age: 51};
        userServiceMock.getUserById.mockResolvedValue(user);
        userServiceMock.updateUser.mockResolvedValue(updatedUser);
        const req = {params: {id}, body: updatedUser} as any;

        await ctrl.update(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(updatedUser);
        expect(nextMock).not.toHaveBeenCalled();
        expect(userServiceMock.getUserById).toHaveBeenCalledWith(id);
        expect(userServiceMock.updateUser).toHaveBeenCalledWith(updatedUser);
    });

    test('Редактирование полей несуществующего юзера', async () => {
        const err = new Error(errorMsg);
        const user = testUsers[0];
        const {id} = user;
        const newId = id + 'd';
        const updatedUser = {...user, age: 51};
        userServiceMock.getUserById.mockRejectedValue(err);
        const req = {params: {id: newId}, body: updatedUser} as any;

        await ctrl.update(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
        expect(userServiceMock.getUserById).toHaveBeenCalledWith(newId);
    });

    test('Изменение пароля существующего юзера', async () => {
        const user = testUsers[0];
        const {id} = user;
        const updatedUser = {...user, password: 'volfin29'};
        const updatedUserHashed = {...updatedUser, password: await hashPassword(updatedUser.password)};
        userServiceMock.getUserById.mockResolvedValue(user);
        userServiceMock.updateUser.mockResolvedValue(updatedUserHashed);
        const req = {params: {id}, body: updatedUser} as any;

        await ctrl.update(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(updatedUserHashed);
        expect(nextMock).not.toHaveBeenCalled();
        expect(userServiceMock.getUserById).toHaveBeenCalledWith(id);
        expect(userServiceMock.updateUser).toHaveBeenCalledWith(updatedUserHashed);
    });

    test('Изменение пароля существующего юзера когда новый пароль не соотвествует шаблону', async () => {
        const user = testUsers[0];
        const {id} = user;
        const updatedUser = {...user, password: 'volfin'};
        const updatedUserHashed = {...updatedUser, password: await hashPassword(updatedUser.password)};
        userServiceMock.getUserById.mockResolvedValue(user);
        userServiceMock.updateUser.mockResolvedValue(updatedUserHashed);
        const req = {params: {id}, body: updatedUser} as any;

        await ctrl.update(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(nextMock.mock.calls[0][0] instanceof BadRequestError).toBeTruthy();
        expect(userServiceMock.getUserById).toHaveBeenCalledWith(id);
    });
});

describe('delete', () => {
    test('Удаление пользователя', async () => {
        const user = testUsers[0];
        const {id} = user;
        userServiceMock.deleteUser.mockResolvedValue(user);
        const req = {params: {id}} as any;

        await ctrl.delete(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(user);
        expect(nextMock).not.toHaveBeenCalled();
        expect(userServiceMock.deleteUser).toHaveBeenCalledWith(id);
    });

    test('Удаление несуществующего пользователя', async () => {
        const user = testUsers[0];
        const id = user.id + 'd';
        userServiceMock.deleteUser.mockResolvedValue(undefined);
        const req = {params: {id}} as any;

        await ctrl.delete(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({publicData: {id}}));
        expect(nextMock.mock.calls[0][0] instanceof NotFoundError).toBeTruthy();
        expect(userServiceMock.deleteUser).toHaveBeenCalledWith(id);
    });

    test('Удаление пользователя: внутренняя ошибка сервиса', async () => {
        const user = testUsers[0];
        const id = user.id + 'd';
        const err = new Error(errorMsg);
        userServiceMock.deleteUser.mockRejectedValue(err);
        const req = {params: {id}} as any;

        await ctrl.delete(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
    });
});

describe('getSuggests', () => {
    test('Поиск юзеров по подстроке логина', async () => {
        const users = testUsers.slice(0, 3);
        userServiceMock.findUserByLogin.mockResolvedValue(users);
        const req = {query: {login: 'andr'}} as any;

        await ctrl.getSuggests(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(users);
        expect(nextMock).not.toHaveBeenCalled();
        expect(userServiceMock.findUserByLogin).toHaveBeenCalledWith(req.query.login, undefined);
    });

    test('Поиск юзеров по несущестующей подстроке логина', async () => {
        userServiceMock.findUserByLogin.mockResolvedValue([]);
        const req = {query: {login: 'andr'}} as any;

        await ctrl.getSuggests(req, responseMock, nextMock);

        expect(responseMock.status).toHaveBeenCalledWith(204);
        expect(responseMock.json).toHaveBeenCalledWith([]);
        expect(nextMock).not.toHaveBeenCalled();
        expect(userServiceMock.findUserByLogin).toHaveBeenCalledWith(req.query.login, undefined);
    });

    test('Поиск юзеров по подстроке логина: внутренняя ошибка сервиса', async () => {
        const err = new Error(errorMsg);
        userServiceMock.findUserByLogin.mockRejectedValue(err);
        const req = {query: {login: 'andr'}} as any;

        await ctrl.getSuggests(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
    });
});

// https://github.com/HugoDF/mock-express-request-response/blob/master/express-handlers.jest-test.js
// https://codewithhugo.com/express-request-response-mocking/
// https://www.jonathancreamer.com/testing-typescript-classes-with-jest-and-jest-mocks/
// https://dev.to/codedivoire/how-to-mock-an-imported-typescript-class-with-jest-2g7j
