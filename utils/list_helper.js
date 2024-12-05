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
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}