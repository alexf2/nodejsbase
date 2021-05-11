import {hashPassword} from './helpers';

export const getTestUsers = async () => ([
    {
        id: '37c5c90e-551d-43ab-af2e-6a424d5e6d2d',
        login: 'Andrey',
        password: await hashPassword('andrey1'),
        age: 27,
        isDeleted: false,
    },
    {
        id: 'bf2ba91c-e3ac-47f4-9e53-6ddb85245659',
        login: 'Alexey',
        password: await hashPassword('alexey1'),
        age: 31,
    },
    {
        id: '0f3b5819-c7fe-4e8f-b061-33f7aa266803',
        login: 'Ilea',
        password: await hashPassword('ilea1'),
        age: 35,
    },
    {
        id: 'ea6c8250-4ed2-47f3-8638-b661400fe24d',
        login: 'Timur',
        password: await hashPassword('timur1'),
        age: 41,
    },
    {
        id: 'bf99e759-a844-43bf-8373-386c22699656',
        login: 'PavelV',
        password: await hashPassword('pavelv1'),
        age: 33,
    },
]);
