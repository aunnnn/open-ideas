const urlRegex = new RegExp(
  // "^" +
    // protocol identifier
    "(?:(?:https?|ftp)://)?" +
    // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
      // IP address exclusion
      // private & local networks
      "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
      "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
      "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
      // IP address dotted notation octets
      // excludes loopback network 0.0.0.0
      // excludes reserved space >= 224.0.0.0
      // excludes network & broacast addresses
      // (first & last IP address of each class)
      "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
      "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
      "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
      // host name
      "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
      // domain name
      "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
      // TLD identifier
      "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
      // TLD may end with dot
      "\\.?" +
    ")" +
    // port number
    "(?::\\d{2,5})?" +
    // resource path
    "(?:[/?#]\\S*)?" +
  "", "ig"
);

export const breakpoint = ':$%_reserved_breakpoint_+^:'

export function insert_anchor(text, baseKey=null) {
  if (!text) return []
  return text.replace(urlRegex, (match) => {
    return `${breakpoint}${match}${breakpoint}`
  })
    .split(breakpoint)
    .map((splited, ind) => {
      const componentKey = `${baseKey}_${ind}`
      if (splited.match(urlRegex)) {
        let url = splited
        if (!splited.match(/^[a-zA-Z]+:\/\//)) {
          url = 'http://' + url
        }
        return <a key={componentKey} href={url} target="__blank" rel="noopener noreferrer">{splited}</a>
      }
      return <span key={componentKey}>{splited}</span>
    })
}