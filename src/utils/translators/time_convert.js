export default (value) => {
    var d = new Date(parseInt(value));
    return d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true,second:'numeric' });
}
