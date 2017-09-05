// Here is the starting point for your application code.

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';

// All stuff below is just to show you how it works. You can delete all of it.
import {remote} from 'electron';
import jetpack from 'fs-jetpack';
// import { greet } from './hello_world/hello_world';
import {login} from './jira/api';
import env from './env';

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files form disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read('package.json', 'json');

const osMap = {
    win32: 'Windows',
    darwin: 'macOS',
    linux: 'Linux',
};

// document.querySelector('#os').innerHTML = osMap[process.platform];
// document.querySelector('#author').innerHTML = manifest.author;
// document.querySelector('#env').innerHTML = env.name;
// document.querySelector('#electron-version').innerHTML = process.versions.electron;

document.querySelector('#sign-in-form').addEventListener('submit', (e) => {
    let form = new FormData(e.target);
    console.log(e.target);
    console.log(form.get('url'));
    try {
        
    login(form.get('host'), form.get('user'), form.get('pass'));
    } catch (e) {
        console.log(e);
    }
    e.preventDefault();
    return false;
});