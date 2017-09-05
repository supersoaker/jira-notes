export const login = (url, username, password) => {
    let JSONObject = {"username": ""+username+"", "password": ""+password+""};

    let client = new XMLHttpRequest();

    url = `${url}/rest/api/2/project`;
    // rest/api/2/project
    client.open("GET", url, false);
    client.setRequestHeader("Content-Type", "application/json");
    client.setRequestHeader("Authorization", 'Basic ' + btoa(`${username}:${password}`));

    client.send(JSONObject);

    if (client.status == 200)
        alert("The request succeeded!\n\nThe response representation was:\n\n" + client.responseText)
    else
        alert("The request did not succeed!\n\nThe response status was: " + client.status + " " + client.statusText + ".");
};

// curl -D- -u fred:fred -X GET -H "Content-Type: application/json" http://kelpie9:8081/rest/api/2/issue/createmeta
//
//     curl -D- -X GET -H "Authorization: Basic ZnJlZDpmcmVk" -H "Content-Type: application/json" "http://kelpie9:8081/rest/api/2/issue/QA-31"
