import * as btoken from 'jsonwebtoken';
import {IUser} from 'DAL/models';
import {getTestUsers} from '../part2_testData';
import {AuthenticationController} from './AuthenticationController';
import {TOKEN_KEY} from './const';
import {UnauthorizedLoginError, UnauthorizedPwdError} from '../helpers';
import {errorMsg, loggerMock, userServiceMock, getResponseMock, nextMock} from '../helpers/mocks';

let responseMock = getResponseMock();

let testUsers: IUser[];
let ctrl: AuthenticationController;

beforeAll(async () => {
    testUsers = await getTestUsers();
    ctrl = new AuthenticationController(loggerMock as any, userServiceMock);
});
afterEach(() => {
    jest.resetAllMocks();
    responseMock = getResponseMock();
});
afterAll(() => jest.restoreAllMocks());

describe('login', () => {
    test('Вход под несуществующим пользователем', async () => {
        const user = testUsers[0];
        const login = user.login + 'd';
        const password = 'andrey1';
        userServiceMock.getUserByLogin.mockResolvedValue(undefined);
        const req = {body: {login, password}} as any;

        await ctrl.login(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({publicData: {login}}));
        expect(nextMock.mock.calls[0][0] instanceof UnauthorizedLoginError).toBeTruthy();
        expect(userServiceMock.getUserByLogin).toHaveBeenCalledWith(login);
    });

    test('Вход с неправильным паролем', async () => {
        const user = testUsers[0];
        const login = user.login;
        const password = 'andrey1222';
        userServiceMock.getUserByLogin.mockResolvedValue(user);
        const req = {body: {login, password}} as any;

        await ctrl.login(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({publicData: {login}}));
        expect(nextMock.mock.calls[0][0] instanceof UnauthorizedPwdError).toBeTruthy();
        expect(userServiceMock.getUserByLogin).toHaveBeenCalledWith(login);
    });

    test('Успешный вход', async () => {
        expect.assertions(6);

        const user = testUsers[0];
        const login = user.login;
        const password = 'andrey1';
        userServiceMock.getUserByLogin.mockResolvedValue(user);
        const req = {body: {login, password}} as any;

        await ctrl.login(req, responseMock, nextMock);

        expect(responseMock.status).toHaveBeenCalledWith(201);
        expect(responseMock.json).toHaveBeenCalled();
        expect(nextMock).not.toHaveBeenCalled();
        expect(userServiceMock.getUserByLogin).toHaveBeenCalledWith(login);

        const token = (responseMock.json as jest.Mock).mock.calls[0][0];
        btoken.verify(token, TOKEN_KEY, (err, decoded) => {
            expect(err).toBeFalsy();
            expect(decoded).toEqual(expect.objectContaining({id: user.id}));
        });
    });

    test('Внутренняя ошибка сервиса', async () => {
        const err = new Error(errorMsg);
        const user = testUsers[0];
        const login = user.login;
        const password = 'andrey1';
        userServiceMock.getUserByLogin.mockRejectedValue(err);
        const req = {body: {login, password}} as any;

        await ctrl.login(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
        expect(userServiceMock.getUserByLogin).toHaveBeenCalledWith(login);
    });
});
