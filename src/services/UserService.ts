import {IUserService} from './services.types';
import {IUser} from 'DAL/models';
import {Logger} from '../helpers';
import {IUserRepository} from 'DAL/dal.types';

export class UserService implements IUserService {
    constructor(private logger: Logger, private db: IUserRepository) {
    }

    public readonly getAllUsers = async (limit?: number | null) => this.db.getAll(limit);

    public readonly countUsers = async () => this.db.count();

    public readonly getUserById = async (id: string) => this.db.getById(id);

    public readonly createUser = async (data: Partial<Readonly<IUser>>) => this.db.create(data);

    public readonly updateUser = async (data: Partial<Readonly<IUser>>) => this.db.update(data.id!, data);

    public readonly deleteUser = async (id: string) => this.db.delete(id);

    public readonly findUserByLogin = async (loginPart: string, limit?: number) => this.db.getSuggests(loginPart, limit);

    public readonly getUserByLogin = async (login: string) => this.db.getUserByLogin(login);
}
