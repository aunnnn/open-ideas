import ipRegex from 'ip-regex'
import tlds from 'tlds'

const opts = { strict: false }
const protocol = `(?:(?:[a-z]+:)?//)${opts.strict ? '' : '?'}`;
const auth = '(?:\\S+(?::\\S*)?@)?';
const ip = ipRegex.v4().source;
const host = '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)';
const domain = '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
const tld = `(?:\\.${opts.strict ? '(?:[a-z\\u00a1-\\uffff]{2,})' : `(?:${tlds.sort((a, b) => b.length - a.length).join('|')})`})\\.?`;
const port = '(?::\\d{2,5})?';
const path = '(?:[/?#][^\\s"]*)?';
const regex = `(?:${protocol}|www\\.)${auth}(?:localhost|${ip}|${host}${domain}${tld})${port}${path}`;
const urlRegex = new RegExp(regex, 'ig');


export const breakpoint = ':$%_reserved_breakpoint_+^:'

export function insert_anchor(text) {
  return text.replace(urlRegex, (match) => {
    return `${breakpoint}${match}${breakpoint}`
  })
    .split(breakpoint)
    .map(splited => {
      if (splited.match(urlRegex)) {
        let url = splited
        if (!splited.match(/^[a-zA-Z]+:\/\//)) {
          url = 'http://' + url
        }
        return <a href={url} target="__blank" rel="noopener noreferrer">{splited}</a>
      }
      return splited
    })
}