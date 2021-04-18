import {User, Group} from '@prisma/client';

export const userModel2View = (u: User) => ({
    ...u,
    groups: (u as any).groups.map(g => ({...g.group})),
});

export const mapUserModel2View = (users: User[]) => users.map(userModel2View);


export const groupModel2View = (g: Group) => ({
    ...g,
    users: (g as any).users.map(u => ({...u.user})),
});

export const mapGroupModel2View = (groups: Group[]) => groups.map(groupModel2View);
