import * as R from 'ramda';
import {v4 as uuidv4} from 'uuid';
import {IUser} from 'DAL/models';
import {CrudMemoryStorageBase} from './CrudMemoryStorageBase';
import {IUserRepository} from './dal.types';

const RESULTSET_LIMIT = 10;

export class UserRepositoryInMemory extends CrudMemoryStorageBase<string, IUser> implements IUserRepository {

    constructor(initialUsers: IUser[] = []) {
        super(initialUsers, true);
    }

    protected generateKey() {
        return uuidv4();
    }

    /**
     * Ищет пользователей по подстроке логина.
     * @param loginPart {string?} - подстрока в логине, по которой идёт фильтрация
     * @param limit {number?} - ограничитель resultSet. По умолчанию 10.
     * @returns {IUser[]} - отфильтрованные и отсортированные по логину пользователи
     */
    public readonly getSuggests = async (loginPart?: string | null, limit?: number | null) => {
        const orderByLogin = R.sortBy(R.prop('login'));
        const match = R.filter<IUser>(item => loginPart ? item.login.includes(loginPart) : true);

        return R.compose<IUser[], IUser[], IUser[], IUser[]>(R.take(limit || RESULTSET_LIMIT), match, orderByLogin)(this.data);
    };
    
    public readonly getUserByLogin = async (login: string) => {
        const res = R.find<IUser>(R.propEq('login', login))(this.data);
        if (this.softDel && res?.isDeleted) {
            return;
        }

        return res && this.cleanFields(res) as any as IUser || res;
    };
}
