import {IDtoWithSoftDel} from '../dal.types';

export interface IUser extends IDtoWithSoftDel<string> {
    id: string;
    login: string;
    password: string;
    age: number;
}
