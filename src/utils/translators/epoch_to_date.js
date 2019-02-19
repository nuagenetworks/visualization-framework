export default (value) => {
    var d = new Date(parseInt(value));
    return d.toLocaleString('en-US', { weekday:"long", month: "short", day: "2-digit" });
  }
  