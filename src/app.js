// Here is the starting point for your application code.

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';

// All stuff below is just to show you how it works. You can delete all of it.
import {remote} from 'electron';
import jetpack from 'fs-jetpack';
// import { greet } from './hello_world/hello_world';
import {callApi,transformQuery} from './jira/api';
import env from './env';
const flatpickr = require("flatpickr");
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

flatpickr(".calendar input", {
    // inline: truedefaultDate: [new Date(), "2016-10-30"]
    defaultDate: new Date(),
    onChange: function(obj, dateString) {
        let user = localStorage.getItem('jira-user');
        let xhr = apiCall(
            localStorage.getItem('jira-host'),
            user,
            localStorage.getItem('jira-pass'),
            `search?jql=timespent > 0 and worklogAuthor=${user} and worklogDate=${dateString}`
        );
        if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            let worklogs = [];
            let html = `
                <tr>
                    <td><textarea></textarea></td>
                    <td><input type="text"></td>
                    <td></td>
                </tr>
                `;
            for (let i in response.issues) {
                let tempXhr = apiCall(localStorage.getItem('jira-host'), user, localStorage.getItem('jira-pass'), `issue/${response.issues[i].id}/worklog`);
                let worklog = JSON.parse(tempXhr.responseText).worklogs;
                for (let j in worklog) {
                    if(worklog[j].author.name === user) {
                        html += `
                        <tr>
                            <td>${worklog[j].comment}</td>
                            <td>${response.issues[i].key}</td>
                            <td>${worklog[j].timeSpent}</td>
                        </tr>
                        `;
                        worklogs.push(worklog);
                    }
                }
            }
            document.getElementById('worklog-list').innerHTML = html;
        }
    }
});


let showPage = (pageName) => {
    let otherPages = document.querySelectorAll('.main>[class$="-page"]');
    let pageElem = document.querySelector(`.main > .${pageName}-page`);
    otherPages.forEach((elem) => {
        if (elem !== pageElem) {
            elem.classList.add('hide');
        }
    });
    if (pageElem) {
        pageElem.classList.remove('hide');
    }
};
let showError = (msg) => {
    if (!msg) {
        document.querySelector('.message-wrapper').classList.add('hide');
        document.querySelector('.message-wrapper').classList.remove('error');
    } else {
        document.querySelector('.message-wrapper').innerHTML = msg;
        document.querySelector('.message-wrapper').classList.remove('hide');
        document.querySelector('.message-wrapper').classList.add('error');
    }
};

window.apiCall = callApi;
window.transformQuery = transformQuery;
if (localStorage.getItem('jira-host')) {
    showPage('overview');
    // let xhr = callApi(
    //     localStorage.getItem('jira-host'),
    //     localStorage.getItem('jira-user'),
    //     localStorage.getItem('jira-pass')
    // );
    // localStorage.setItem('jira-projects', xhr.responseText);
    // let projects = JSON.parse(xhr.responseText);
    // let html = '';
    // projects.forEach((project) => {
    //     html +=  `<li>${project.name} (${project.key})</li>`;
    // });
    // document.getElementById('project-list').innerHTML = html;

}


document.querySelector('#sign-in-form').addEventListener('submit', (e) => {
    let form = new FormData(e.target);
    try {
        /** @var XMLHTTPRequest xhr */
        let xhr = callApi(form.get('host'), form.get('user'), form.get('pass'));
        if (xhr.status === 200) {
            localStorage.setItem('jira-host', form.get('host'));
            localStorage.setItem('jira-user', form.get('user'));
            localStorage.setItem('jira-pass', form.get('pass'));
            localStorage.setItem('jira-projects', xhr.responseText);
            showPage('overview');
        }
        if (xhr.status === 401 || xhr.status === 403) {
            showError('Bad credentials');
        }
        if (xhr.responseText === '[]') {
            showError('Wrong url or no projects available');
        }
        if (xhr.status === 0) {
            showError('Error when accessing url');
        }
    } catch (e) {
        showError('Error when accessing url');
    }
    e.preventDefault();
    return false;
});