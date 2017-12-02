// Here is the starting point for your application code.

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';

// All stuff below is just to show you how it works. You can delete all of it.
import {remote} from 'electron';
import jetpack from 'fs-jetpack';
// import { greet } from './hello_world/hello_world';
import {jiraApi} from './jira/api';
import {convertTimeFromJira, convertMinutesToJira} from './jira/converter';
import env from './env';

const flatpickr = require("flatpickr");
const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// here files form disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read('package.json', 'json');

const osMap = {
    win32:  'Windows',
    darwin: 'macOS',
    linux:  'Linux',
};

let escapeHTML = (str) => {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

let observeDOM = (function () {
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;

    return function (obj, callback) {
        if (MutationObserver) {
            // define a new observer
            let obs = new MutationObserver(function (mutations, observer) {
                if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
                    callback();
                }
            });
            // have the observer observe foo for changes in children
            obs.observe(obj, {childList: true, subtree: true});
        }
        else {
            if (eventListenerSupported) {
                obj.addEventListener('DOMNodeInserted', callback, false);
                obj.addEventListener('DOMNodeRemoved', callback, false);
            }
        }
    };
})();

// Observe a specific DOM element:
observeDOM(document.getElementById('work-log-list'), function () {
    // Update time spend sum
    let sum = '';
    document.querySelectorAll('.work-log-item .time-spend').forEach((elem) => {
        // if(elem.indexOf('<input') === -1) {
        //     let elems = elem.split(' ');
        //     for (let i in elems) {
        //         if(elems.indexOf('d')) {
        //
        //         }
        //     }
        //     sum += elem.innerHTML;
        // }
    });
});

class UiController {
    static updateTimeSpent() {

    }

    static showWorkLogs(workLogs = []) {
        let html = '';
        let timeLogs = [];
        for (let j = 0; j <= workLogs.length; j++) {
            html += `
            <tr class="work-log-item">
                <td class="status-column" data-status="saved">
                    <svg class="status-saved" viewBox="0 0 1024 1024" aria-labelledby="bisi-ant-check-circle-o-title"><path d="M821 331q-9-9-22.5-9t-22.5 9L383 713 247 584q-9-10-22.5-10T202 584q-10 9-10 22.5t10 22.5l158 152q10 9 23 9t23-9l415-405q10-9 10-22.5T821 331zM512 64q91 0 174 36 80 33 142 96 63 62 96 142 36 83 36 174t-36 174q-33 80-96 142-62 63-142 96-83 36-174 36t-174-36q-80-33-143-96-61-61-95-142-36-83-36-174t36-174q33-80 96-142 62-63 142-96 83-36 174-36zm0-64Q408 0 313 41T150 150 41 313 0 512t41 199 109 163 163 109 199 41 199-41 163-109 109-163 41-199-41-199-109-163T711 41 512 0z"></path></svg>
                    <svg class="status-upload" viewBox="0 0 1024 768" aria-labelledby="bzsi-ant-cloud-upload-o-title"><path d="M602 64q49 0 91 17 43 17 77 51 35 34 53 76 15 34 17 75l2 32 27 17q32 21 55 54l3 5q16 25 25 52 8 27 8 57 0 42-15 78-16 36-46.5 66T831 689t-80 15H243q-37 0-69-13-31-13-57-38-27-26-40-57t-13-67q0-30 10-57.5t29-51.5q22-26 50-42l38-22-6-43q-1-7-1-17 0-23 8-44 9-21 27-38 17-17 38-25 22-9 46-9 19 0 35 5l43 13 26-37q25-33 61-57 60-40 134-40zm0-64q-94 0-170 51-45 30-76 73-25-8-53-8-37 0-70 13.5T174 169q-27 26-41 58-13 33-13 70 0 13 1 26-38 22-67 57Q0 445 0 529q0 50 18 93 18 42 53.5 76.5t79 52T243 768h508q55 0 104-19.5t88.5-58.5 59.5-86q21-49 21-104 0-79-44-145-31-46-76-76-3-51-22-97-23-52-67-96-44-42-98-64Q664 0 602 0zm39 608V302l95 95q9 9 22.5 9t22.5-9q9-10 9-23t-9-23L632 202q-10-9-23-9t-23 9L437 351q-9 10-9 23t9 23q9 9 22.5 9t22.5-9l95-95v306q0 13 9.5 22.5T609 640t22.5-9.5T641 608z"></path></svg>
                    <svg class="status-error" viewBox="0 0 1024 1024" aria-labelledby="cwsi-ant-exclamation-circle-o-title"><path d="M512 704q-13 0-22.5-9.5T480 672V224q0-13 9.5-22.5T512 192t22.5 9.5T544 224v448q0 13-9.5 22.5T512 704zm0 128q-13 0-22.5-9.5T480 800t9.5-22.5T512 768t22.5 9.5T544 800t-9.5 22.5T512 832zm0-768q91 0 174 35 81 34 143 96t96 143q35 83 35 174t-35 174q-34 81-96 143t-143 96q-83 35-174 35t-174-35q-81-34-143-96T99 686q-35-83-35-174t35-174q34-81 96-143t143-96q83-35 174-35zm0-64Q373 0 255 68.5T68.5 255 0 512t68.5 257T255 955.5t257 68.5 257-68.5T955.5 769t68.5-257-68.5-257T769 68.5 512 0z"></path></svg>
                </td>
                <td>${workLogs[j] ? escapeHTML(workLogs[j].comment) : '<textarea></textarea>'}</td>
                <td>${workLogs[j] ? escapeHTML(workLogs[j].issueKey) : '<input type="text">'}</td>
                <td class="time-spend">${workLogs[j] ? escapeHTML(workLogs[j].timeSpent) : '<input type="text">'}</td>
            </tr>`;
            if(workLogs[j] ) {
                timeLogs.push(workLogs[j].timeSpent);
            }
        }
        document.getElementById('work-log-list').innerHTML = html;
        document.getElementById('time-spent-sum').innerHTML = convertMinutesToJira(convertTimeFromJira(timeLogs));

    };

    static showPage(pageName) {
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
        if (pageName === 'overview') {
            this.showWorkLogs();
        }
    };

    static showError(msg) {
        if (!msg) {
            document.querySelector('.message-wrapper').classList.add('hide');
            document.querySelector('.message-wrapper').classList.remove('error');
        }
        else {
            document.querySelector('.message-wrapper').innerHTML = msg;
            document.querySelector('.message-wrapper').classList.remove('hide');
            document.querySelector('.message-wrapper').classList.add('error');
        }
    };
}


flatpickr(".calendar input", {
    defaultDate: new Date(),
    onChange:    function (obj, dateString) {
        let user = localStorage.getItem('jira-user');
        let xhr = jiraApi.getWorklogByDate((response) => {
            let workLogs = [];
            response = JSON.parse(response);
            // tempWorklog['issueKey'] = response.issues[i].key;
            // tempWorklog['comment'] = response.issues[i].key;
            // tempWorklog['timeSpent'] = response.issues[i].key;
            for (let i in response.issues) {
                callApi(localStorage.getItem('jira-host'), user, localStorage.getItem('jira-pass'), `issue/${response.issues[i].id}/worklog`, (response2) => {
                    let workLogArray = JSON.parse(response2)['worklogs'];
                    for (let j in workLogArray) {
                        let actualDate = new Date(dateString);
                        let dateToCheck = new Date(workLogArray[j].started);
                        let sameDate = (dateToCheck.getDate() === actualDate.getDate()
                        && dateToCheck.getMonth() === actualDate.getMonth()
                        && dateToCheck.getFullYear() === actualDate.getFullYear());
                        if (workLogArray[j].author.name == user && sameDate) {
                            workLogArray[j].issueKey = response.issues[i].key;
                            workLogs.push(workLogArray[j]);
                        }
                    }
                    if (i == response.issues.length - 1) {
                        UiController.showWorkLogs(workLogs);
                    }
                });
            }
        }, dateString);
    }
});


if (localStorage.getItem('jira-host')) {
    UiController.showPage('overview');
}


document.querySelector('#sign-in-form').addEventListener('submit', (e) => {
    let form = new FormData(e.target);
    try {
        /** @var XMLHTTPRequest xhr */
        localStorage.setItem('jira-host', form.get('host'));
        localStorage.setItem('jira-user', form.get('user'));
        localStorage.setItem('jira-pass', form.get('pass'));
        let xhr = jiraApi.signIn();
    }
    catch (e) {
        showError('Error when accessing url');
    }
    e.preventDefault();
    return false;
});
