export const jiraApi = {
    call : (success, endpoint, urlParam, data = {}, type = 'GET', contentType = 'application/json', error) => {
        let jiraHost = localStorage.getItem('jira-host');
        let username = localStorage.getItem('jira-user');
        let password = localStorage.getItem('jira-pass');

        let url = `${jiraHost}${endpoint}${urlParams}`;

        let client = new XMLHttpRequest();
        client.open(type, url, true);
        client.setRequestHeader("Content-Type", `${contentType}`);
        client.setRequestHeader("Authorization", 'Basic ' `${username}:${password}`);

        client.onload = function (e) {
            if (client.readyState === 4) {
                if (client.status === 200) {
                    success(client.responseText);
                }
                else {
                    error(e, client);
                }
            }
        };
        client.onerror = function (e) {

            error(e, client);
        };

        client.send(JSONObject);

        return client;

    },

    createWorklog : (success, issueKey, date, billedTime, comment) => {
        if(issueKey && date && billedTime && comment){
            let endpoint = 'rest/tempo-rest/1.0/worklogs/';
            let urlParam = issueKey;
            let type = 'POST';
            let contentType = 'application/x-www-form-urlencoded';

            let data = {
                'ansidate': date,// '2017-12-02'
                'user' : localStorage.getItem('jira-user'),
                'date' : date,
                'enddate' : date,
                'time' : billedTime,
                'billedTime' : billedTime,
                'comment' : comment,
            };
            return this.call(success, endpoint, urlParam, data, type, contentType); // todo debartu, wo error handling
        }else{
            throw "Some Params are missing";
        }
    },

    editWorklog : (success, worklogId, desc, date, hours, issueKey) => {
        let endpoint = 'rest/tempo-rest/1.0/worklogs/';
        let type = 'POST';
        let contentType = 'application/x-www-form-urlencoded';
        let urlParam = "";

        let data = {
            'worklogId': worklogId, // '280036'
            'worklogDescription': desc, // 'test 04'
            'worklogDate': date, // '2017-12-03T00:00'
            'worklogHours':hours, // '0,10'
            'hourType':'hoursSpent'
        };

        if(!worklogId){
            throw "Worklog Id not set";
        }else if(desc){
            // https://jira.isa-hamburg.com/rest/tempo-rest/1.0/worklogs/description/update
           urlParam =  'description/update';

        }else if(date){
            // https://jira.isa-hamburg.com/rest/tempo-rest/1.0/worklogs/date/update
           urlParam =  'date/update';

        }else if(hours){
            // https://jira.isa-hamburg.com/rest/tempo-rest/1.0/worklogs/hours/update
           urlParam =  'hours/update';

        }else if(issueKey && worklogId){
            // https://jira.isa-hamburg.com/rest/tempo-rest/1.0/worklogs/IPI-147/280042
            data = {
                'user': localStorage.getItem('jira-user'), // 'dbartuschat'
                'date': date, //'02/Dez/17'
                'enddate': date, // '02/Dez/17'
                'formtype':'move',
                'issue': issueKey, // 'IPI-148'
                'time': hours // '0,25'
            };

            urlParam = issueKey + '/update/' + worklogId;
        }else{
            throw "No Method Matching";
        }
        return this.call(success, endpoint, urlParam, data, type, contentType);
    },
    getWorklogByDate : (success, date) => {
        let endpoint = 'rest/api/2/';
        let username = localStorage.getItem('jira-user');

        let urlParam = `search?jql=timespent > 0 AND worklogAuthor=${username} AND worklogDate='${date}'`;

        return this.call(success, endpoint, urlParam);
    },
    signIn : () => {
        return this.call((response) => {
            localStorage.setItem('jira-projects', response);
            UiController.showPage('overview');
        }, 'project/', "", {}, 'GET', 'application/json', (e, xhr) => {
            if (xhr.status === 401 || xhr.status === 403) {
                showError('Bad credentials');
            }
            if (xhr.responseText === '[]') {
                showError('Wrong url or no projects available');
            }
            if (xhr.status === 0) {
                showError('Error when accessing url');
            }
        });
    },
};

/*
    Create
    https://jira.isa-hamburg.com/rest/tempo-rest/1.0/worklogs/IPI-147

    Field Types
     id:
     type:
     use-ISO8061-week-numbers:true
     ansidate:2017-12-02
     ansienddate:2017-12-02
     selected-panel:0
     analytics-origin:TempoUserBoard-timesheet
     startTimeEnabled:false
     tracker:false
     planning:false
     user:dbartuschat
     issue:IPI-147
     date:02.12.2017
     enddate:02.12.2017
     time:,25
     billedTime:,25
     remainingEstimate:0h
     comment:test 01
 */


/*
 Update
 https://jira.isa-hamburg.com/rest/tempo-rest/1.0/worklogs/hours/update
 https://jira.isa-hamburg.com/rest/tempo-rest/1.0/worklogs/description/update
 https://jira.isa-hamburg.com/rest/tempo-rest/1.0/worklogs/date/update

 Field-Types
 worklogId:280036
 worklogDescription:test 04
 worklogDate:2017-12-03T00:00
 worklogHours:0,10
 hourType:hoursSpent

 https://jira.isa-hamburg.com/rest/tempo-rest/1.0/worklogs/IPI-147/280042
 user:dbartuschat
 date:02/Dez/17
 enddate:02/Dez/17
 formtype:move
 issue:IPI-148
 time:0,25
 remainingEstimate:

 */