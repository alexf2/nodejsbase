import * as R from 'ramda';
import {v4 as uuidv4} from 'uuid';
import {User} from './models';
import {CrudMemoryStorageBase} from './CrudMemoryStorageBase';
import {IUserStorage} from './dal.types';

const RESULTSET_LIMIT = 10;

export class UserStorage extends CrudMemoryStorageBase<string, User> implements IUserStorage {

    constructor(users: User[] = []) {
        super(users, true);
    }

    protected generateKey() {
        return uuidv4();
    }

    /**
     * Ищет пользователей по подстроке логина.
     * @param loginPart {string?} - подстрока в логине, по которой идёт фильтрация
     * @param limit {number?} - ограничитель resultSet. По умолчанию 10.
     * @returns {User[]} - отфильтрованные и отсортированные по логину пользователи
     */
    public readonly getSuggests = (loginPart?: string | null, limit?: number | null) => {
        const orderByLogin = R.sortBy(R.prop('login'));
        const match = R.filter<User>(item => loginPart ? item.login.includes(loginPart) : true);

        return R.compose<User[], User[], User[], User[]>(R.take(limit || RESULTSET_LIMIT), match, orderByLogin)(this.users);
    };
}
