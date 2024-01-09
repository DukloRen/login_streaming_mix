import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { newMusicDto } from './newMusicDto';
import { newUserDto } from './newUserDto';
import { Response } from 'express';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    index(session: Record<string, any>): Promise<{
        title: string;
        index: mysql.OkPacket | mysql.RowDataPacket[] | mysql.ResultSetHeader[] | mysql.RowDataPacket[][] | mysql.OkPacket[] | mysql.ProcedureCallPacket;
        username: string;
        loggedin: boolean;
    }>;
    form(): {
        title: string;
        errors: any[];
    };
    formPost(newMusic: newMusicDto, res: Response): Promise<void>;
    registerForm(): {
        title: string;
    };
    register(newUser: newUserDto): Promise<{
        url: string;
    }>;
    loginForm(): {
        title: string;
    };
    login(newUser: newUserDto, session: Record<string, any>): Promise<{
        url: string;
    }>;
    logout(session: Record<string, any>): {
        url: string;
    };
}
