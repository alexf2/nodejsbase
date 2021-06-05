import {IGroup} from 'DAL/models';
import {testGroups as sourceGroups} from '../part4_testData';
import {GroupController} from './GroupController';
import {NotFoundError, BadRequestError, hashPassword} from '../helpers';
import {errorMsg, loggerMock, groupServiceMock, getResponseMock, nextMock} from '../helpers/mocks';

let responseMock = getResponseMock();

let testGroups: IGroup[];
let ctrl: GroupController;

beforeAll(async () => {
    testGroups = [...sourceGroups];
    ctrl = new GroupController(loggerMock as any, groupServiceMock);
});
afterEach(() => {
    jest.resetAllMocks();
    responseMock = getResponseMock();
});
afterAll(() => jest.restoreAllMocks());

describe('getAll', () => {
    test('Получение всех групп', async () => {
        groupServiceMock.getAllGroups.mockResolvedValue(testGroups);
        const req = {query: {}} as any;

        await ctrl.getAll(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(testGroups);
        expect(nextMock).not.toHaveBeenCalled();
    });

    test('Получение всех групп, когда ни одной ещё не создано', async () => {
        groupServiceMock.getAllGroups.mockResolvedValue([]);
        const req = {query: {}} as any;

        await ctrl.getAll(req, responseMock, nextMock);

        expect(responseMock.status).toHaveBeenCalledWith(204);
        expect(responseMock.json).toHaveBeenCalledWith([]);
        expect(nextMock).not.toHaveBeenCalled();
    });

    test('Получение групп с ограничением размера возвращаемых данных', async () => {
        groupServiceMock.getAllGroups.mockResolvedValue(testGroups);
        const req = {query: {limit: 3}} as any;

        await ctrl.getAll(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(testGroups);
        expect(nextMock).not.toHaveBeenCalled();
        expect(groupServiceMock.getAllGroups).toHaveBeenCalledWith(3);
    });

    test('Получение всех групп: внутренняя ошибка сервиса', async () => {
        const err = new Error(errorMsg);
        groupServiceMock.getAllGroups.mockRejectedValue(err);
        const req = {query: {}} as any;

        await ctrl.getAll(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
    });
});

describe('getCount', () => {
    test('Получение количества всех групп', async () => {
        groupServiceMock.countGroups.mockResolvedValue(3);
        const req = {query: {}} as any;

        await ctrl.getCount(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(3);
        expect(nextMock).not.toHaveBeenCalled();
    });

    test('Получение количества всех групп: внутренняя ошибка сервиса', async () => {
        const err = new Error(errorMsg);
        groupServiceMock.countGroups.mockRejectedValue(err);
        const req = {query: {}} as any;

        await ctrl.getCount(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
    });
});

describe('getById', () => {
    test('Получение группы по id', async () => {
        const group = testGroups[0];
        groupServiceMock.getGroupById.mockResolvedValue(group);
        const req = {params: {id: group.id}} as any;

        await ctrl.getById(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(group);
        expect(nextMock).not.toHaveBeenCalled();
        expect(groupServiceMock.getGroupById).toHaveBeenCalledWith(group.id);
    });

    test('Получение группы по несуществующему id', async () => {
        const group = testGroups[0];
        const id = group.id + 'd';
        groupServiceMock.getGroupById.mockResolvedValue(undefined);
        const req = {params: {id}} as any;

        await ctrl.getById(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({publicData: {id}}));
        expect(nextMock.mock.calls[0][0] instanceof NotFoundError).toBeTruthy();
        expect(groupServiceMock.getGroupById).toHaveBeenCalledWith(id);
    });
});

describe('create', () => {
    test('Добавление новой группы', async () => {
        const {id, ...rest} = testGroups[0];
        const newGroup = {...rest, id: '11c5c90e-551d-43ab-af2e-6a424d5e6d2d'};
        groupServiceMock.createGroup.mockResolvedValue(newGroup);
        const req = {body: {...rest}} as any;

        await ctrl.create(req, responseMock, nextMock);

        expect(responseMock.status).toHaveBeenCalledWith(201);
        expect(responseMock.json).toHaveBeenCalledWith(expect.objectContaining(newGroup));
        expect(nextMock).not.toHaveBeenCalled();
        expect(groupServiceMock.createGroup).toHaveBeenCalledWith({...rest});
    });

    test('Добавление новой группы: внутренняя ошибка сервиса', async () => {
        const err = new Error(errorMsg);
        const {id, ...rest} = testGroups[0];
        groupServiceMock.createGroup.mockRejectedValue(err);
        const req = {body: {...rest}} as any;

        await ctrl.create(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
        expect(groupServiceMock.createGroup).toHaveBeenCalledWith({...rest});
    });
});

describe('update', () => {
    test('Редактирование полей существующей группы', async () => {
        const group = testGroups[0];
        const {id} = group;
        const updatedGroup = {...group, name: 'Guest test'};
        groupServiceMock.updateGroup.mockResolvedValue(updatedGroup);
        const req = {params: {id}, body: updatedGroup} as any;

        await ctrl.update(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(updatedGroup);
        expect(nextMock).not.toHaveBeenCalled();
        expect(groupServiceMock.updateGroup).toHaveBeenCalledWith(updatedGroup);
    });

    test('Редактирование полей несуществующей группы', async () => {
        const err = new Error(errorMsg);
        const group = testGroups[0];
        const {id} = group;
        const newId = id + 'd';
        const updatedGroup = {...group, name: 'Guest test'};
        groupServiceMock.updateGroup.mockRejectedValue(err);
        const req = {params: {id: newId}, body: updatedGroup} as any;

        await ctrl.update(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
        expect(groupServiceMock.updateGroup).toHaveBeenCalledWith({...updatedGroup, id: newId});
    });
});

describe('delete', () => {
    test('Удаление группы', async () => {
        const group = testGroups[0];
        const {id} = group;
        groupServiceMock.deleteGroup.mockResolvedValue(group);
        const req = {params: {id}} as any;

        await ctrl.delete(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).toHaveBeenCalledWith(group);
        expect(nextMock).not.toHaveBeenCalled();
        expect(groupServiceMock.deleteGroup).toHaveBeenCalledWith(id);
    });

    test('Удаление несуществующей группы', async () => {
        const group = testGroups[0];
        const id = group.id + 'd';
        groupServiceMock.deleteGroup.mockResolvedValue(undefined);
        const req = {params: {id}} as any;

        await ctrl.delete(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(expect.objectContaining({publicData: {id}}));
        expect(nextMock.mock.calls[0][0] instanceof NotFoundError).toBeTruthy();
        expect(groupServiceMock.deleteGroup).toHaveBeenCalledWith(id);
    });

    test('Удаление группы: внутренняя ошибка сервиса', async () => {
        const user = testGroups[0];
        const id = user.id + 'd';
        const err = new Error(errorMsg);
        groupServiceMock.deleteGroup.mockRejectedValue(err);
        const req = {params: {id}} as any;

        await ctrl.delete(req, responseMock, nextMock);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.json).not.toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalledWith(err);
    });
});

describe('addUsersToGroup', () => {
    test('Добавление пользователя к группе', async () => {
        const group = testGroups[0];
        const {id} = group;
        const users = ['u1', 'u2'];
        groupServiceMock.addUsersToGroup.mockResolvedValue(users);
        const req = {params: {id}, body: users} as any;

        await ctrl.addUsersToGroup(req, responseMock, nextMock);

        console.log(process.env.NODE_ENV);

        expect(responseMock.status).not.toHaveBeenCalled();
        expect(responseMock.send).toHaveBeenCalledWith(users);
        expect(nextMock).not.toHaveBeenCalled();
        expect(groupServiceMock.addUsersToGroup).toHaveBeenCalledWith(id, users);
    });
});
