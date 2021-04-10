import {v4 as uuidv4} from 'uuid';
import {PrismaClient} from '@prisma/client'
import {IUser} from 'DAL/models';
import {IUserRepository} from './dal.types';
import {Env} from '../helpers';

const RESULTSET_LIMIT = 10;

const getPrismaConfig = () => {
    const config = {} as any;

    if (Env.isDevelopment()) {
        config.log = [{
            emit: 'stdout',
            level: 'query',
        }];
    }

    return config;
};
export class UserRepositoryPrisma implements IUserRepository {
    private dbClient = new PrismaClient(getPrismaConfig());
    private ownsClient: boolean;

    constructor (client?: PrismaClient) {
        this.dbClient = client || new PrismaClient(getPrismaConfig());
        this.ownsClient = Boolean(client);
    }

    public readonly open = () => this.ownsClient ? this.dbClient.$connect() : Promise.resolve();
    public readonly destroy = () => this.ownsClient ? this.dbClient.$disconnect() : Promise.resolve();

    public readonly getAll = async (limit?: number | null) => this.dbClient.user.findMany(
        {
            where: {OR: [{isDeleted: false}, {isDeleted: null}]},
            ...(limit && {take: limit}),
        },
    );

    public readonly getById = async (id: string) =>
        this.dbClient.user.findUnique({where: {id}})
            .then(user => user?.isDeleted ? undefined : user);

    public readonly create = async (user?: Partial<IUser> | null) => {
        const {isDeleted, ...rest} = user || {} as IUser;

        return this.dbClient.user.create(
            {data: {
                ...rest,
                id: uuidv4(),
            } as IUser},
        );
    }

    public readonly update = async (userId: string, user: Partial<IUser>) => {
        const {id, isDeleted, ...rest} = user;

        return this.dbClient.user.update({
            where: {id: userId},
            data: {...rest} as IUser,
        });
    }

    public readonly delete = async (id: string) =>
        this.dbClient.user.update({
            where: {id},
            data: {isDeleted: true} as IUser,
        }).catch(err => {
            if (err.code === 'P2025') {
                return undefined;
            }
            throw err;
        });
        /*this.dbClient.user.delete({where: {id}})
            .catch(err => {
                if (err.code === 'P2025') {
                    return undefined;
                }
                throw err;
            });*/

    public readonly clear = async () => (await this.dbClient.user.deleteMany()).count;

    public readonly count = async () => this.dbClient.user.count({where: {OR: [{isDeleted: false}, {isDeleted: null}]}});

    /**
     * Ищет пользователей по подстроке логина.
     * @param loginPart {string?} - подстрока в логине, по которой идёт фильтрация
     * @param limit {number?} - ограничитель resultSet. По умолчанию 10.
     * @returns {IUser[]} - отфильтрованные и отсортированные по логину пользователи
     */
    public readonly getSuggests = async (loginPart?: string | null, limit?: number | null) =>
        this.dbClient.user.findMany({
            where: {
                login: {
                    contains: loginPart!,
                    mode: 'insensitive',
                },
                OR: [{isDeleted: false}, {isDeleted: null}],
            },
            take: limit || RESULTSET_LIMIT,
        });
}
