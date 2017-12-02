// Here is the starting point for your application code.

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';

// All stuff below is just to show you how it works. You can delete all of it.
import {remote} from 'electron';
import jetpack from 'fs-jetpack';
// import { greet } from './hello_world/hello_world';
import {jiraApi} from './jira/api';
import {UiController} from './app/UiController';
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

flatpickr(".calendar input", {
    defaultDate: new Date(),
    onChange:    function (obj, dateString) {
        let user = localStorage.getItem('jira-user');
        let xhr = callApi(
            localStorage.getItem('jira-host'),
            user,
            localStorage.getItem('jira-pass'),
            `rest/tempo-timesheets/3/worklogs/?dateFrom=${dateString}&dateTo=${dateString}&username=mruescher`,
            (response) => {
                response = JSON.parse(response);
                if (response.length > 0) {
                    UiController.showWorkLogs(response);
                }
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
