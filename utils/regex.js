import urlRegex from 'url-regex';

export function insert_anchor(text) {
  return text.replace(urlRegex(), (match) => {
    let url = match
    if (!match.match(/^[a-zA-Z]+:\/\//)) {
      url = 'http://' + url
    }
    return `<a href="${url}" target="__blank" rel="noopener noreferrer">${match}</a>`
  })
}