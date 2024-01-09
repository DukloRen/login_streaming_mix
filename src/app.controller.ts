import { Body, Controller, Get, Post, Redirect, Render, Res, Session } from '@nestjs/common';
import * as mysql from 'mysql2';
import * as bcrypt from 'bcrypt';
import { AppService } from './app.service';
import { newMusicDto } from './newMusicDto';
import { newUserDto } from './newUserDto';
import { Response } from 'express';

const conn = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'musicstreaming',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index(@Session() session: Record<string, any>) {
    let username = '';
    let loggedin = false;
    if (session.user_id) {
      const [rows]: any = await conn.execute(
        'SELECT username FROM users WHERE id = ?',
        [session.user_id],
      );
      username = rows[0].username;
      loggedin = true;
    }

    const [data] = await conn.execute('SELECT id, title, artist, length FROM zeneszamok ORDER BY artist, title');

    return { title: 'Kezdőoldal', index: data, username, loggedin };
  }

  @Get('/form')
  @Render('form')
  form() {
    return { title: 'Zene hozzáadása', errors: [] };
  }

  @Post('/form')
  @Render('form')
  async formPost(@Body() newMusic: newMusicDto, @Res() res: Response) {
    const errors: string[] = [];
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
    } else {
      const title: string = newMusic.title;
      const artist: string = newMusic.artist;
      const length: number = newMusic.length;
      await conn.execute('INSERT INTO zeneszamok (title, artist, length) VALUES (?, ?, ?)', [title, artist, length]);
      res.redirect('/');
    }
  }

  @Get('/register')
  @Render('register')
  registerForm() {
    return { title: 'Regisztráció' };
  }

  @Post('/register')
  @Redirect()
  async register(@Body() newUser: newUserDto) {
    const username: string = newUser.username;
    const password: string = await bcrypt.hash(newUser.password, 10);
    await conn.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    return {
      url: '/',
    };
  }

  @Get('/login')
  @Render('login')
  loginForm() {
    return { title: 'Bejelentkezés' };
  }

  @Post('/login')
  @Redirect()
  async login(@Body() newUser: newUserDto, @Session() session: Record<string, any>,) {
    const [rows]: any = await conn.execute(
      'SELECT id, username, password FROM users WHERE username = ?',
      [newUser.username],
    );
    if (rows.length == 0) {
      return { url: '/login' };
    }
    if (await bcrypt.compare(newUser.password, rows[0].password)) {
      session.user_id = rows[0].id;
      return { url: '/' };
    } else {
      return { url: '/login' };
    }
  }

  @Get('/logout')
  @Redirect()
  logout(@Session() session: Record<string, any>) {
    session.user_id = null;
    return { url: '/' };
  }
}
