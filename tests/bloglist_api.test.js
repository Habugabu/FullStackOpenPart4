const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest.agent(app)

const initialBlogs = helper.initialBlogs

const mainUser = {
    username: "admin",
    password: "admin1"
}

const creds = {id: "", auth: ""}

beforeEach(async () => {
    await User.deleteMany({})
    const userResponse = await api.post('/api/users').send(mainUser)
    creds.id = userResponse.body.id
    const loginResponse = await api.post('/api/login').send(mainUser)
    creds.auth = `Bearer ${loginResponse.body.token}`
    api.set('Authorization', creds.auth)
    await Blog.deleteMany({})
    for (let i = 0; i < initialBlogs.length; i++) {
        await api.post('/api/blogs').send(initialBlogs[i])
    }
})

describe('get request...', () => {
    test('returns blogs as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('returns correct amount of blogs', async () => {
        const response = await api.get('/api/blogs')

        assert.strictEqual(response.body.length, initialBlogs.length)
    })

    test('identifier field of blogs is named id', async () => {
        const response = await api.get('/api/blogs')
        const blogsWithIdField = response.body.filter(blog => blog.id !== undefined)

        assert.strictEqual(blogsWithIdField.length, initialBlogs.length)
    })
})
describe('post request...', () => {
    test('correctly adds blog to db', async () => {
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

        assert.deepStrictEqual(newBlog, {user: creds.id, ...blog})

        assert.strictEqual(getResponse.body.length, initialBlogs.length + 1)

        assert(getResponse.body.map(b => b.title).includes(blog.title))
    })
    test('without the likes property sets it to 0 by default', async () => {
        const blog = {
            title: "Test",
            author: "Tester",
            url: "localhost",
        }
        const response = await api.post('/api/blogs').send(blog)

        assert.strictEqual(response.body.likes, 0)
    })
    test('without a title or url will result in a bad request response', async () => {
        const blog1 = {
            author: "Tester",
            url: "localhost",
            likes: 1
        }
        const blog2 = {
            title: "Test",
            author: "Tester",
            likes: 1
        }
        await api
            .post('/api/blogs')
            .send(blog1)
            .expect(400)
        await api
            .post('/api/blogs')
            .send(blog2)
            .expect(400)
    })
    test ('fails without valid token/authorization', async () => {
        const blog = {
            title: "Test",
            author: "Tester",
            url: "localhost",
            likes: 99
        }
        await api
            .post('/api/blogs')
            .set('authorization', '')
            .send(blog)
            .expect(401)
    })
})

describe('delete request...', () => {
    test('returns appropriate status codes', async () => {
        const response = await api.get('/api/blogs')
        await api //successful deletion
            .del(`/api/blogs/${response.body[0].id}`)
            .expect(204)
        await api //blog doesn't exist
            .del(`/api/blogs/${response.body[0].id}`)
            .expect(204)
    })
    test('removes that blog from the db', async () => {
        const response = await api.get('/api/blogs')
        await api.del(`/api/blogs/${response.body[0].id}`)
        const responseAfter = await api.get('/api/blogs')
    
        assert.strictEqual(responseAfter.body.length, response.body.length - 1)
    
        assert.deepStrictEqual(responseAfter.body, response.body.filter(blog => blog.id !== response.body[0].id))
    })
})
describe('put request...', () => {
    test('returns appropriate status codes', async () => {
        const response = await api.get('/api/blogs')
        await api //successful update
            .put(`/api/blogs/${response.body[0].id}`)
            .send(response.body[0])
            .expect(201)
        await api //blog doesn't exist
            .put(`/api/blogs/foo${response.body[0].id}`)
            .send(response.body[0])
            .expect(400)
    })
    test('correctly updates blog', async () => {
        const response = await api.get('/api/blogs')
        const updatedBlog1 = {likes: response.body[1].likes + 1, ...response.body[1]}
        await api.put(`/api/blogs/${response.body[1].id}`).send(updatedBlog1)
        const responseAfter = await api.get('/api/blogs')
    
        assert.deepStrictEqual(responseAfter.body.filter(b => b.id === updatedBlog1.id), [updatedBlog1])
    })
})

after(async () => {
  await mongoose.connection.close()
})