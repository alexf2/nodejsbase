import {Opt} from '../mentoring.types';

export interface DtoWithId<T> {
    id: T;
}

export interface DtoWithSoftDel<T> extends DtoWithId<T> {
    isDeleted: boolean;
}

export interface IStorage<TDto, TKey> {
    getAll: (top?: number) => Readonly<TDto>[];
    getById: (id: TKey) => Opt<Readonly<TDto>>;
    create: (data: Opt<Partial<TDto>>) => TDto;
    update: (id: TKey, data: Partial<TDto>) => Opt<Readonly<TDto>>;
    delete: (id: TKey) => Opt<Readonly<TDto>>;
    clear: () => number;
    count: () => number;
}
