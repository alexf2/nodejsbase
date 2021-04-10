import {Opt} from '../mentoring.types';
import {IUser} from 'DAL/models';

export interface IDtoWithId<T> {
    id: T;
}

export interface IDtoWithSoftDel<T> extends IDtoWithId<T> {
    isDeleted?: boolean | null;
}

export interface IStorage {
    open: () => Promise<void>;
    destroy: () => Promise<void>;
}

export interface ICrudStorage<TDto, TKey> {
    getAll: (limit?: number | null) => Promise<TDto[]>;
    getById: (id: TKey) => Promise<Opt<TDto>>;
    create: (data: Opt<Partial<Readonly<TDto>>>) => Promise<TDto>;
    update: (id: TKey, data: Partial<Readonly<TDto>>) => Promise<Opt<TDto>>;
    delete: (id: TKey) => Promise<Opt<TDto>>;
    clear: () => Promise<number>;
    count: () => Promise<number>;
}

export interface IUserRepository extends ICrudStorage<IUser, string>, IStorage {
    getSuggests: (loginPart?: string | null, limit?: number | null) => Promise<IUser[]>;
}
