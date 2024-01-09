"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const app_service_1 = require("./app.service");
const newMusicDto_1 = require("./newMusicDto");
const newUserDto_1 = require("./newUserDto");
const conn = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'musicstreaming',
}).promise();
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async index(session) {
        let username = '';
        let loggedin = false;
        if (session.user_id) {
            const [rows] = await conn.execute('SELECT username FROM users WHERE id = ?', [session.user_id]);
            username = rows[0].username;
            loggedin = true;
        }
        const [data] = await conn.execute('SELECT id, title, artist, length FROM zeneszamok ORDER BY artist, title');
        return { title: 'Kezdőoldal', index: data, username, loggedin };
    }
    form() {
        return { title: 'Zene hozzáadása', errors: [] };
    }
    async formPost(newMusic, res) {
        const errors = [];
        if (newMusic.artist.trim() === '') {
            errors.push('Adja meg az előadó nevét!');
        }
        if (newMusic.title.trim() === '') {
            errors.push('Adja meg a zene címét!');
        }
        if (newMusic.length <= 50 || isNaN(newMusic.length)) {
            errors.push('A zene hossza legalább 50 másodperc kell legyen!');
        }
        if (errors.length > 0) {
            res.render('form', { title: 'Zene hozzáadása', errors });
        }
        else {
            const title = newMusic.title;
            const artist = newMusic.artist;
            const length = newMusic.length;
            await conn.execute('INSERT INTO zeneszamok (title, artist, length) VALUES (?, ?, ?)', [title, artist, length]);
            res.redirect('/');
        }
    }
    registerForm() {
        return { title: 'Regisztráció' };
    }
    async register(newUser) {
        const username = newUser.username;
        const password = await bcrypt.hash(newUser.password, 10);
        await conn.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
        return {
            url: '/',
        };
    }
    loginForm() {
        return { title: 'Bejelentkezés' };
    }
    async login(newUser, session) {
        const [rows] = await conn.execute('SELECT id, username, password FROM users WHERE username = ?', [newUser.username]);
        if (rows.length == 0) {
            return { url: '/login' };
        }
        if (await bcrypt.compare(newUser.password, rows[0].password)) {
            session.user_id = rows[0].id;
            return { url: '/' };
        }
        else {
            return { url: '/login' };
        }
    }
    logout(session) {
        session.user_id = null;
        return { url: '/' };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Render)('index'),
    __param(0, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "index", null);
__decorate([
    (0, common_1.Get)('/form'),
    (0, common_1.Render)('form'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "form", null);
__decorate([
    (0, common_1.Post)('/form'),
    (0, common_1.Render)('form'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [newMusicDto_1.newMusicDto, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "formPost", null);
__decorate([
    (0, common_1.Get)('/register'),
    (0, common_1.Render)('register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "registerForm", null);
__decorate([
    (0, common_1.Post)('/register'),
    (0, common_1.Redirect)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [newUserDto_1.newUserDto]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('/login'),
    (0, common_1.Render)('login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "loginForm", null);
__decorate([
    (0, common_1.Post)('/login'),
    (0, common_1.Redirect)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [newUserDto_1.newUserDto, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('/logout'),
    (0, common_1.Redirect)(),
    __param(0, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "logout", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map