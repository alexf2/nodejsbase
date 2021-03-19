import * as R from 'ramda';
import {v4 as uuidv4} from 'uuid';
import {User} from './models';
import {CrudMemoryStorageBase} from './CrudMemoryStorageBase';

export class UserStorage extends CrudMemoryStorageBase<string, User> {

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
    public readonly getSuggests = (loginPart?: string, top = 10) => {
        const orderByLogin = R.sortBy(R.prop('login'));
        const match = R.filter<User>(item => loginPart ? item.login.includes(loginPart) : true);

        return R.compose<User[], User[], User[], User[]>(R.take(top), match, orderByLogin)(this.users);
    };
}
