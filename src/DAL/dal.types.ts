import {Opt} from '../mentoring.types';
import {IUser} from 'DAL/models';

export interface IDtoWithId<T> {
    id: T;
}

export interface IDtoWithSoftDel<T> extends IDtoWithId<T> {
    isDeleted: boolean;
}

export interface ICrudStorage<TDto, TKey> {
    getAll: (limit?: number | null) => Readonly<TDto>[];
    getById: (id: TKey) => Opt<Readonly<TDto>>;
    create: (data: Opt<Partial<TDto>>) => TDto;
    update: (id: TKey, data: Partial<TDto>) => Opt<Readonly<TDto>>;
    delete: (id: TKey) => Opt<Readonly<TDto>>;
    clear: () => number;
    count: () => number;
}

export interface IUserStorage extends ICrudStorage<IUser, string> {
    getSuggests: (loginPart?: string | null, limit?: number | null) => IUser[];
}
