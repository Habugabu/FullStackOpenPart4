const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'must be logged in' })
  }
  const blog = new Blog({user: user._id, ...request.body})

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'must be logged in' })
  }
  const blog = await Blog.findById(request.params.id)
  if (blog && blog.user.toString() !== user._id.toString()) {
    return response.status(401).json({ error: 'blog not owned by this user' })
  }
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body
  const blog = await Blog.findByIdAndUpdate(request.params.id, 
    { title, author, url, likes }, { new: true, runValidators: true, context: 'query' })
    .populate('user', {username: 1, name: 1})
  response.status(201).json(blog)
})

module.exports = blogsRouter