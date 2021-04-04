
import * as R from 'ramda';
import {ICrudStorage, IDtoWithSoftDel} from './dal.types';

export abstract class CrudMemoryStorageBase<TKey, TDto extends IDtoWithSoftDel<TKey>> implements ICrudStorage<TDto, TKey> {
    private readonly cleanFields = R.dissoc('isDeleted');
    protected data: TDto[];

    constructor(initialData: TDto[] = [], protected softDel: boolean) {
        this.data = initialData;
    }

    public readonly open = () => Promise.resolve();
    public readonly destroy = () => Promise.resolve();

    protected abstract generateKey(): TKey;

    public readonly getAll = async (limit?: number | null) => {
        const topF = R.take(limit || this.data.length);
        if (this.softDel) {
            return R.compose<TDto[], TDto[], TDto[], TDto[]>(
                R.map(this.cleanFields) as any,
                topF,
                R.filter(R.complement(R.propEq('isDeleted', true)) as any) as any,
            )(this.data);
        }

        return topF(this.data);
    }

    public readonly getById = async (id: TKey) => {
        const res = R.find<TDto>(R.propEq('id', id))(this.data);
        if (this.softDel && res?.isDeleted) {
            return;
        }

        return res && this.cleanFields(res) as any as TDto || res;
    }

    public readonly create = async (data?: Partial<TDto>) => {
        const {isDeleted, ...rest} = data || {};
        const item = {...rest, id: this.generateKey()} as TDto;
        this.data.push(item);

        return item;
    };

    public readonly update = async (id: TKey, data: Partial<TDto>) => {
        const i = R.findIndex<TDto>(R.propEq('id', id), this.data);
        if (i > -1) {
            const it = this.data[i];
            if (this.softDel && it.isDeleted) {
                return;
            }

            const {isDeleted, ...rest} = data;
            const newItem = R.merge(it, {...rest, id}) as TDto;
            this.data = R.update(i, newItem)(this.data);

            return newItem;
        }
    }

    public readonly delete = async (id: TKey) => {
        const i = R.findIndex<TDto>(R.propEq('id', id), this.data);
        if (i > -1) {
            const item = this.data[i];
            if (this.softDel) {
                item.isDeleted = true;
            } else {
                this.data = R.remove(i, 1, this.data);
            }

            return this.cleanFields(item) as any as TDto;
        }
    }
    
    public readonly clear = async () => {
        const size = this.data.length;
        if (this.softDel) {
            this.data.forEach(item => item.isDeleted = true);
        } else {
            this.data.length = 0;
        }
        return size;
    }

    public readonly count = async () => {
        if (this.softDel) {
            return this.data.reduce((prev, curr, i) => prev + (curr.isDeleted ? 0 : 1), 0);
        } else {
            return this.data.length;
        }
    }
}
