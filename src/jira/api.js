export const callApi = (url, username, password, query = 'project') => {
    let JSONObject = {"username": ""+username+"", "password": ""+password+""};

    let client = new XMLHttpRequest();

    url = `${url}/rest/api/2/${query}`;
    // rest/api/2/project

    // No async !!1
    client.open("GET", url, false);
    client.setRequestHeader("Content-Type", "application/json");
    client.setRequestHeader("Authorization", 'Basic ' + btoa(`${username}:${password}`));

    client.send(JSONObject);

    return client;
};
export const getIssuesByProject = (project, url, username, password) => {
    let JSONObject = {"username": ""+username+"", "password": ""+password+""};

    let client = new XMLHttpRequest();

    url = `${url}/rest/api/2/project`;

    // No async !!1
    client.open("GET", url, false);
    client.setRequestHeader("Content-Type", "application/json");
    client.setRequestHeader("Authorization", 'Basic ' + btoa(`${username}:${password}`));

    client.send(JSONObject);

    return client;
};
