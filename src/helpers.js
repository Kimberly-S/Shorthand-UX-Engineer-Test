export function formatDate (premiereDate) {
    let dateString  = premiereDate;
    let dateArray = dateString.split('-');
    let months   = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (`${[dateArray[2]]}  ${months[parseInt(dateArray[1])]}  ${dateArray[0]}`);
}