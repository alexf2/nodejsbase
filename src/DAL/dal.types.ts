import {Opt} from '../mentoring.types';
import {User} from './models';

export interface DtoWithId<T> {
    id: T;
}

export interface DtoWithSoftDel<T> extends DtoWithId<T> {
    isDeleted: boolean;
}

export interface IStorage<TDto, TKey> {
    getAll: (limit?: number | null) => Readonly<TDto>[];
    getById: (id: TKey) => Opt<Readonly<TDto>>;
    create: (data: Opt<Partial<TDto>>) => TDto;
    update: (id: TKey, data: Partial<TDto>) => Opt<Readonly<TDto>>;
    delete: (id: TKey) => Opt<Readonly<TDto>>;
    clear: () => number;
    count: () => number;
}

export interface IUserStorage extends IStorage<User, string> {
    getSuggests: (loginPart?: string | null, limit?: number | null) => User[];
}
