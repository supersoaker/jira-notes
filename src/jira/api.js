export const callApi = (url, username, password, query = 'project', success, error) => {
    let JSONObject = {"username": "" + username + "", "password": "" + password + ""};

    let client = new XMLHttpRequest();

    url = `${url}/rest/api/2/${query}`;
    // rest/api/2/project

    // async !!1
    client.open("GET", url, true);
    client.setRequestHeader("Content-Type", "application/json");
    client.setRequestHeader("Authorization", 'Basic ' + btoa(`${username}:${password}`));
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
};