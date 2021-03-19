import {DtoWithSoftDel} from '../dal.types';

export interface User extends DtoWithSoftDel<string> {
    id: string;
    login: string;
    password: string;
    age: number;
}
