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
  
module.exports = {
    dummy,
    totalLikes
}