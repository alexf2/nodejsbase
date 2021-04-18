import {IUser, IGroup} from 'DAL/models';
import {Opt} from '../mentoring.types';

export interface IUserService {
    getAllUsers: (limit?: number | null) => Promise<IUser[]>;
    countUsers: () => Promise<number>;
    getUserById: (id: string) => Promise<Opt<IUser>>;
    createUser: (data: Partial<Readonly<IUser>>) => Promise<IUser>;
    updateUser: (data: Partial<Readonly<IUser>>) => Promise<Opt<IUser>>;
    deleteUser: (id: string) => Promise<Opt<IUser>>;
    findUserByLogin: (loginPart: string, limit?: number) => Promise<IUser[]>;
}

export interface IGroupService {
    getAllGroups: (limit?: number | null) => Promise<IGroup[]>;
    countGroups: () => Promise<number>;
    getGroupById: (id: string) => Promise<Opt<IGroup>>;
    createGroup: (data: Partial<Readonly<IGroup>>) => Promise<IGroup>;
    updateGroup: (data: Partial<Readonly<IGroup>>) => Promise<Opt<IGroup>>;
    deleteGroup: (id: string) => Promise<Opt<IGroup>>;
    addUsersToGroup: (groupId: string, userIds: string[]) => Promise<string[]>;
}
