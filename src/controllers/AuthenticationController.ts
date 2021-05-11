import {ValidatedRequest} from 'express-joi-validation';
import {compareSync} from 'bcrypt';
import * as btoken from 'jsonwebtoken';
import {IUser} from 'DAL/models';
import {NextFunction, Response, Router} from 'express';
import {Logger, ForbiddenLoginError, ForbiddenPwdError, getRequestIdMeta} from '../helpers';
import {IUserService} from '../services';
import {ControllerBase} from './ControllerBase';
import {
    authControllerValidator,
    LoginBodySchema,
    bodyLogin,
} from './authcontroller.schemas';
import {BASE_URL, TOKEN_KEY} from './const';

const LOGIN_ROUTE = 'login';
export const FULL_LOGIN_ROUTE = `${BASE_URL}/${LOGIN_ROUTE}`;

export class AuthenticationController extends ControllerBase {
    constructor(logger: Logger, private userService: IUserService) {
        super(BASE_URL, logger);
    }

    public get loginRoute() {
        return this.makePath(LOGIN_ROUTE);
    }

    private readonly createAccessToken = (user: IUser) => ({
        id: user.id,
        login: user.login,
        groups: ((user as any).groups || []).map(({id, name}) => ({id, name})),
    });

    public readonly login = async (req: ValidatedRequest<LoginBodySchema>, res: Response, next: NextFunction) => {
        this.logger.debug('login called', getRequestIdMeta(req));

        try {
            const {login, password} = req.body;
            const user = await this.userService.getUserByLogin(login);

            if (user) {
                if (compareSync(password, user.password)) {
                    res.json(btoken.sign(this.createAccessToken(user), TOKEN_KEY));
                } else {
                    throw new ForbiddenPwdError(login);
                }
            } else {
                throw new ForbiddenLoginError(login);
            }
        } catch (err) {
            next(err);
        }
    }

    protected readonly installRoutes = (router: Router) => {
        router
            .post(`/${LOGIN_ROUTE}`,
                authControllerValidator.body(bodyLogin),
                this.login);

        this.logger.debug(`Route POST ${this.loginRoute} added`);
    }
}
