import urlRegex from 'url-regex'

export const breakpoint = ':$%_reserved_breakpoint_+^:'

export function insert_anchor(text) {
  return text.replace(urlRegex(), (match) => {
    return `${breakpoint}${match}${breakpoint}`
  })
    .split(breakpoint)
    .map(splited => {
      if (splited.match(urlRegex())) {
        let url = splited
        if (!splited.match(/^[a-zA-Z]+:\/\//)) {
          url = 'http://' + url
        }
        return <a href={url} target="__blank" rel="noopener noreferrer">{splited}</a>
      }
      return splited
    })
}