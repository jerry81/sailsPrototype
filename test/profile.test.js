
const request = require('supertest')

describe('test profile', () => {
    let server
    beforeAll(() => {
        server = require('../src/controller/server')
    })
    afterAll(() => {
        if (server) {
            server.close()
        }
    })
    
    it('findAll test', async done => {
        jest.setTimeout(20000)
        // TODO: remove this hack and make connecting to the db synchronous
        setTimeout(async () => {
            const response = await request(server).get('/user/findAll')
            expect(response.status).toBe(200)
            expect(response.body.length).toBe(0)
            done()
        }, 8000)
    })

    it('can create user and edit user', async done => {
        jest.setTimeout(20000)
        const response = await request(server).post('/user/')
        .send({ name: 'testName', email: 'testEmail' })
        .set('Content-Type', 'application/json')
        .set('Access-Control-Allow-Origin', '*',)
        .set('decryption-token', 'testPassword')
        expect(response.status).toBe(200)
        expect(response.body.insertedCount).toBe(1)

        const getResponse = await request(server).get('/user/findAll')
        expect(getResponse.status).toBe(200)
        expect(getResponse.body.length).toBe(1)
        done()
    })

})
