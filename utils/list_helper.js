const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return (
        blogs.length !== 0
        ? blogs.map(blog => blog.likes).reduce((likes, total) => total + likes)
        : 0
    )
}

const favoriteBlog = (blogs) => {
    return (
        blogs.length !== 0
        ? blogs.reduce((blog, favorite) => blog.likes > favorite.likes ? blog : favorite)
        : undefined
    )
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return undefined
    const counts = _.countBy(blogs, (blog => blog.author))
    const authorWithMost = _.max(Object.keys(counts), o => counts[o]);
    const result = {
        author: authorWithMost,
        blogs: counts[authorWithMost]
    }
    return result
}

const mostLikes = (blogs) => {
    return undefined
}
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}