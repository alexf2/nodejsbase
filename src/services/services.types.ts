import {IUser} from 'DAL/models';

export interface IUserService {
    getAllUsers: (limit?: number | null) => Promise<IUser[]>;
    countUsers: () => Promise<number>;
    getUserById: (id: string) => Promise<IUser | undefined>;
    createUser: (data: Partial<Readonly<IUser>>) => Promise<IUser>;
    updateUser: (data: Partial<Readonly<IUser>>) => Promise<IUser | undefined>;
    deleteUser: (id: string) => Promise<IUser | undefined>;
    findUserByLogin: (loginPart: string, limit?: number) => Promise<IUser[]>;
}
