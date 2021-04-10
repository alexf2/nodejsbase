import {Application} from 'express';

export interface IController {
    readonly install: (app: Application) => void;
    isInstalled: boolean;
};

