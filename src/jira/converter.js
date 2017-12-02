/**
 * Convert Jira time into minutes
 * @param time
 * @param add
 * @returns {*}
 */
export const convertTimeFromJira = (time = 0, add = 0) => {
    // Make sure time is not an array otherwise use recursion
    if(Array.isArray()) {
        return time.reduce(convertTime, add);
    }
    let sum = 0;
    time.split(' ').forEach(function (item) {
        if(item.toUpperCase().indexOf('D')) {
            sum += time.slice(0, -1) * 480;
        }
        if(item.toUpperCase().indexOf('H')) {
            sum += time.slice(0, -1) * 60;
        }
        if(item.toUpperCase().indexOf('M')) {
            sum += time.slice(0, -1);
        }
    });
    return sum + add;
};