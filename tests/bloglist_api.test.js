const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
    {
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
    },
    {
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
    },
    {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    },
    {
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10,
    },
    {
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      likes: 0,
    },
    {
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2,
    }  
  ]

beforeEach(async () => {
    await Blog.deleteMany({})
    for (let i = 0; i < initialBlogs.length; i++) {
        let blogObject = new Blog(initialBlogs[i])
        await blogObject.save()
    }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('correct amount of blogs returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, initialBlogs.length)
})

test('identifier field is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogsWithIdField = response.body.filter(blog => blog.id !== undefined)

    assert.strictEqual(blogsWithIdField.length, initialBlogs.length)
})

test('post correctly adds blog to db', async () => {
    const blog = {
        title: "Test",
        author: "Tester",
        url: "localhost",
        likes: 99
    }
    const postResponse = await api.post('/api/blogs').send(blog)
    const newBlog = {...postResponse.body}
    delete newBlog.id

    const getResponse = await api.get('/api/blogs')

    assert.deepStrictEqual(newBlog, blog)

    assert.strictEqual(getResponse.body.length, initialBlogs.length + 1)

    assert(getResponse.body.map(b => b.title).includes(blog.title))
})

test('posting a blog without the likes property sets it to 0 by default', async () => {
    const blog = {
        title: "Test",
        author: "Tester",
        url: "localhost",
    }
    const response = await api.post('/api/blogs').send(blog)

    assert.strictEqual(response.body.likes, 0)
})

after(async () => {
  await mongoose.connection.close()
})