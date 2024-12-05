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
    const countsByAuthor = _.countBy(blogs, (blog => blog.author))
    const authorWithMost = _.max(Object.keys(countsByAuthor), author => countsByAuthor[author]);
    const result = {
        author: authorWithMost,
        blogs: countsByAuthor[authorWithMost]
    }
    return result
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return undefined
    const blogsByAuthor = _.groupBy(blogs, (blog => blog.author))
    const authors = Object.keys(blogsByAuthor)
    const likesArr = authors.map(author => totalLikes(blogsByAuthor[author]))
    const indexWithMost = likesArr.indexOf(Math.max(...likesArr));
    const result = {
        author: authors[indexWithMost],
        likes: likesArr[indexWithMost]
    }
    return result
}
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}