import {IUser} from 'DAL/models';
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
