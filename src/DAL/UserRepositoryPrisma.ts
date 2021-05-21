import {v4 as uuidv4} from 'uuid';
import {PrismaClient} from '@prisma/client'
import {IUser, userModel2View, mapUserModel2View} from '../DAL/models';
import {IUserRepository} from './dal.types';
import {Config} from '../helpers';
import {prismaErrorFilter} from './repositoryHelpers';

const RESULTSET_LIMIT = 10;

const includeGroupsCondition = {
    include: {
        groups: {
            select: {
                group: true,
            },
        },
    },
};

export class UserRepositoryPrisma implements IUserRepository {
    private dbClient;
    private ownsClient: boolean;

    constructor (client?: PrismaClient) {
        this.ownsClient = !client;
        this.dbClient = client || new PrismaClient(Config.prismaConfig);
    }

    public readonly open = () => this.ownsClient ? this.dbClient.$connect() : Promise.resolve();
    public readonly destroy = () => this.ownsClient ? this.dbClient.$disconnect() : Promise.resolve();

    public readonly getAll = async (limit?: number | null) => this.dbClient.user.findMany(
        {
            where: {OR: [{isDeleted: false}, {isDeleted: null}]},
            ...(limit && {take: limit}),
            ...includeGroupsCondition,
        },
    ).then(mapUserModel2View);

    public readonly getById = async (id: string) =>
        this.dbClient.user.findUnique({where: {id}, ...includeGroupsCondition})
            .then(user => user?.isDeleted ? undefined : user)
            .then(userModel2View);

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
            ...includeGroupsCondition,
        })
            .then(userModel2View)
            .catch(prismaErrorFilter);
    }

    /*public readonly delete = async (id: string) =>
        this.dbClient.user.update({
            where: {id},
            data: {isDeleted: true} as IUser,
        }).catch(prismaErrorFilter);*/

    public readonly delete = async (id: string) => {
        const checkUser = await this.dbClient.user.findMany(
            {
                where: {AND: [{id}, {OR: [{isDeleted: false}, {isDeleted: null}]}]},
            },
        );
        if (checkUser.length === 0) {
            return;
        }

        const [links, user] = await this.dbClient.$transaction([
            this.dbClient.userGroup.deleteMany({where: {idUser: id}}),

            this.dbClient.user.update({
                where: {id},
                data: {isDeleted: true} as IUser,
                ...includeGroupsCondition,
            }),
        ])
            .catch(prismaErrorFilter);

        return userModel2View(user);
    }

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
            ...includeGroupsCondition,
        }).then(mapUserModel2View);

    public readonly getUserByLogin = async (login: string) =>
        this.dbClient.user.findUnique({where: {login}, ...includeGroupsCondition})
            .then(user => user?.isDeleted ? undefined : user)
            .then(userModel2View);
}
