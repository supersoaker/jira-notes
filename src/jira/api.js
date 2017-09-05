export const getProjects = (url, username, password) => {
    let JSONObject = {"username": ""+username+"", "password": ""+password+""};

    let client = new XMLHttpRequest();

    url = `${url}/rest/api/2/project`;
    // rest/api/2/project

    // No async !!1
    client.open("GET", url, false);
    client.setRequestHeader("Content-Type", "application/json");
    client.setRequestHeader("Authorization", 'Basic ' + btoa(`${username}:${password}`));

    client.send(JSONObject);

    return client;
};

// curl -D- -u fred:fred -X GET -H "Content-Type: application/json" http://kelpie9:8081/rest/api/2/issue/createmeta
//
//     curl -D- -X GET -H "Authorization: Basic ZnJlZDpmcmVk" -H "Content-Type: application/json" "http://kelpie9:8081/rest/api/2/issue/QA-31"
