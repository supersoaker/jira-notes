/**
 * Convert Jira time into minutes
 * @param {string|array} time
 * @returns {int}
 */
export const convertTimeFromJira = (time = 0) => {
    // Make sure time is not an array otherwise use recursion
    if(Array.isArray(time)) {
        let sum = 0;
        time.forEach((item) => {
            sum += convertTimeFromJira(item);
        });
        return sum;
    }
    let sum = 0;
    time += ''; // time to string
    time.split(' ').forEach(function (item) {
        if(item.toUpperCase().indexOf('D') >= 0) {
            sum += (+item.slice(0, -1)) * 480;
        }
        if(item.toUpperCase().indexOf('H') >= 0) {
            sum += (+item.slice(0, -1)) * 60;
        }
        if(item.toUpperCase().indexOf('M') >= 0) {
            sum += (+item.slice(0, -1));
        }
    });
    return sum;
};
/**
 * Convert minutes into Jira time
 * @param {int} time
 * @returns {string}
 */
export const convertMinutesToJira = (time = 0) => {
    let timeString = '';
    if(time / 480 > 1) {
        timeString += parseInt(time / 480) + 'd';
        time = time % 480;
    }
    if(time / 60 > 1) {
        timeString += parseInt(time / 60) + 'h';
        time = time % 60;
    }
    if(time >= 1) {
        timeString += time + 'm';
    }

    return timeString;
};
