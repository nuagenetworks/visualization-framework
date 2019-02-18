export default (value) => {
    var d = new Date(parseInt(value));
    return d.toLocaleString('en-US', { weekday:"long", year: "numeric", month: "2-digit", day: "2-digit" });
  }
  