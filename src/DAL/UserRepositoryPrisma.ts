import {v4 as uuidv4} from 'uuid';
import {PrismaClient, User} from '@prisma/client'
import {IUser} from 'DAL/models';
import {IUserRepository} from './dal.types';

const RESULTSET_LIMIT = 10;

export class UserRepositoryPrisma implements IUserRepository {
    public readonly open = () => Promise.resolve();
    public readonly destroy = () => Promise.resolve();

    public readonly getAll = async (limit?: number | null) => {
        const i = 1;
        return [] as IUser[];
    }

    public readonly getById = async (id: string) => {
        const i = 1;
        return {} as IUser;
    }

    public readonly create = async (data?: Partial<IUser>) => {
        const i = 1;
        return {} as IUser;
    }

    public readonly update = async (id: string, data: Partial<IUser>) => {
        const i = 1;
        return {} as IUser;
    }

    public readonly delete = async (id: string) => {
        const i = 1;
        return {} as IUser;
    }

    public readonly clear = async () => {
        const i = 1;
        return i;
    }

    public readonly count = async () => {
        const i = 1;
        return i;
    }

    /**
     * Ищет пользователей по подстроке логина.
     * @param loginPart {string?} - подстрока в логине, по которой идёт фильтрация
     * @param limit {number?} - ограничитель resultSet. По умолчанию 10.
     * @returns {IUser[]} - отфильтрованные и отсортированные по логину пользователи
     */
    public readonly getSuggests = async (loginPart?: string | null, limit?: number | null) => {
        const i = 1;
        return [] as IUser[];
    };
}
