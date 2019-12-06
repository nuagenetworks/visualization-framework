export default (value) => {
    var d = new Date(parseInt(value));
    return d.toLocaleString('en-US', { month: "short", day: "2-digit" });
  }
  