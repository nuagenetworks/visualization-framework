export default (value) => {
    var d = new Date(parseInt(value));
    return d.toLocaleTimeString();
}
