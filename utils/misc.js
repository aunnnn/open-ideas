export const computeSlugFromChatTitleAndID = (title, id) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') // allow only alphanumeric and space
    .replace(/\s\s+/g, ' ') // replace multiple spaces with one space
    .trim()
    .split(" ")
    .join("-") + `-${id}`
}

export const chatroomIDFromSlug = (slug) => {
  if (!slug) return null
  return (slug + '').split('-').pop()
}
