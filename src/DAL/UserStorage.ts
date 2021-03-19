import * as R from 'ramda';
import {v4 as uuidv4} from 'uuid';
import {User} from './models';
import {CrudMemoryStorageBase} from './CrudMemoryStorageBase';
import {IUserStorage} from './dal.types';

export class UserStorage extends CrudMemoryStorageBase<string, User> implements IUserStorage {

    constructor(users: User[] = []) {
        super(users, true);
    }

    protected generateKey() {
        return uuidv4();
    }

    /**
     * 
     * @param loginPart {string?} - подстрока в логине, по которой идёт фильтрация
     * @returns {User[]} - отфильтрованные и отсортированные по логину пользователи
     */
    public readonly getSuggests = (loginPart?: string | null, limit?: number | null) => {
        const orderByLogin = R.sortBy(R.prop('login'));
        const match = R.filter<User>(item => loginPart ? item.login.includes(loginPart) : true);

        return R.compose<User[], User[], User[], User[]>(R.take(limit || 10), match, orderByLogin)(this.users);
    };
}
