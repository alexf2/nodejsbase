import {v4 as uuidv4} from 'uuid';

export const testUsers = [
    {
        id: uuidv4(),
        login: 'Andrey',
        password: 'xxx',
        age: 27,
        isDeleted: false,
    },
    {
        id: uuidv4(),
        login: 'Alexey',
        password: 'yyy',
        age: 31,
    },
    {
        id: uuidv4(),
        login: 'Ilea',
        password: '12345678',
        age: 35,
    },
    {
        id: uuidv4(),
        login: 'Timur',
        password: '_12345678',
        age: 41,
    },
    {
        id: uuidv4(),
        login: 'PavelV',
        password: 'zzz_yyy',
        age: 33,
    },
];
