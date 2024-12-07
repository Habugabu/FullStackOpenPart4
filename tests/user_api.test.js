const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

describe('creating a new user...', () => {
    test('adds the user to db', async () => {
        const usersBefore = await helper.usersInDb()
        const newUser = {
            username: "Test",
            password: "Tester"
        }
        await api.post('/api/users').send(newUser)
        const usersAfter = await helper.usersInDb()

        assert.strictEqual(usersAfter.length, usersBefore.length + 1)

        assert(usersAfter.map(user => user.username).includes(newUser.username))
    })
    test('with a username of length < 3 results in error', async () => {
        const newUser = {
            username: "hi",
            password: "byebye"
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })
    test('with a password of length < 3 results in error', async () => {
        const newUser = {
            username: "yes",
            password: "no"
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
    })
    test('invalid users are not added to db', async () => {
        const usersBefore = await helper.usersInDb()
        const newUser = {
            username: "hi",
            password: "no"
        }
        await api.post('/api/users').send(newUser)
        const usersAfter = await helper.usersInDb()

        assert.strictEqual(usersAfter.length, usersBefore.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})