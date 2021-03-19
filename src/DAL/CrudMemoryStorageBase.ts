
import * as R from 'ramda';
import {IStorage, DtoWithSoftDel} from './dal.types';

export abstract class CrudMemoryStorageBase<TKey, TDto extends DtoWithSoftDel<TKey>> implements IStorage<TDto, TKey> {
    constructor(protected users: TDto[] = [], protected softDel: boolean) {
    }

    protected abstract generateKey(): TKey;

    public readonly getAll = (limit?: number | null) => {
        const topF = R.take(limit || this.users.length);
        if (this.softDel) {
            return R.compose<TDto[], TDto[], TDto[]>(topF, R.filter(R.complement(R.propEq('isDeleted', true)) as any) as any)(this.users);
        }
        return topF(this.users);
    }

    public readonly getById = (id: TKey) => {
        const res = R.find<TDto>(R.propEq('id', id))(this.users);
        if (this.softDel && res?.isDeleted) {
            return;
        }
        return res;
    }

    public readonly create = (data?: Partial<TDto>) => {
        const {isDeleted, ...rest} = data || {};
        const item = {...rest, id: this.generateKey()} as TDto;
        this.users.push(item);
        return item;
    };

    public readonly update = (id: TKey, data: Partial<TDto>) => {
        const i = R.findIndex<TDto>(R.propEq('id', id), this.users);
        if (i > -1) {
            const it = this.users[i];
            if (this.softDel && it.isDeleted) {
                return;
            }

            const {isDeleted, ...rest} = data;
            const newItem = R.merge(it, {...rest, id}) as TDto;
            this.users = R.update(i, newItem)(this.users);
            return newItem;
        }
    }

    public readonly delete = (id: TKey) => {
        const i = R.findIndex<TDto>(R.propEq('id', id), this.users);
        if (i > -1) {
            const item = this.users[i];
            if (this.softDel) {
                item.isDeleted = true;
            } else {
                this.users = R.remove(i, 1, this.users);
            }
            return item;
        }
    }
    
    public readonly clear = () => {
        const size = this.users.length;
        if (this.softDel) {
            this.users.forEach(item => item.isDeleted = true);
        } else {
            this.users.length = 0;
        }
        return size;
    }

    public readonly count = () => {
        if (this.softDel) {
            return this.users.reduce((prev, curr, i) => prev + (curr.isDeleted ? 0 : 1), 0);
        } else {
            return this.users.length;
        }
    }
}
