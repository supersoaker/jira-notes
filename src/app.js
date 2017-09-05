// Here is the starting point for your application code.

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';

// All stuff below is just to show you how it works. You can delete all of it.
import {remote} from 'electron';
import jetpack from 'fs-jetpack';
// import { greet } from './hello_world/hello_world';
import {getProjects} from './jira/api';
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

let showPage = (pageName) => {
    let otherPages = document.querySelectorAll('.main>[class$="-page"]');
    let pageElem = document.querySelector(`.main > .${pageName}-page`);
    otherPages.forEach((elem) => {
        if(elem !== pageElem) {
            elem.classList.add('hide');
        }
    });
    if (pageElem) {
        pageElem.classList.remove('hide');
    }
};
let showError = (msg) => {
    if(!msg) {
        document.querySelector('.message-wrapper').classList.add('hide');
        document.querySelector('.message-wrapper').classList.remove('error');
    } else {
        document.querySelector('.message-wrapper').classList.add('error');
        document.querySelector('.message-wrapper').classList.remove('hide');
        document.querySelector('.message-wrapper').innerHTML = msg;
    }
};
if (localStorage.getItem('jira-host')) {
    showPage('overview');
}
document.querySelector('#sign-in-form').addEventListener('submit', (e) => {
    let form = new FormData(e.target);
    try {
        /** @var XMLHTTPRequest xhr */
        let xhr = getProjects(form.get('host'), form.get('user'), form.get('pass'));
        if (xhr.status == 200) {
            localStorage.setItem('jira-host', form.get('host'));
            localStorage.setItem('jira-user', form.get('user'));
            localStorage.setItem('jira-pass', form.get('pass'));
        }
        if (xhr.status == 401 || xhr.status == 403) {
            showError('Bad credentials');
        }
        if(xhr.responseText == '[]') {
            showError('Wrong url or no projects available');
        }
        if(xhr.status === 0) {
            showError('Error when accessing url');
        }
        // if (client.status == 200)
        //     alert("The request succeeded!\n\nThe response representation was:\n\n" + client.responseText)
        // else
        //     alert("The request did not succeed!\n\nThe response status was: " + client.status + " " + client.statusText + ".");
        console.log(xhr);
    } catch (e) {
        showError('Error when accessing url');
        console.log(e);
        console.error(e);
    }
    e.preventDefault();
    return false;
});