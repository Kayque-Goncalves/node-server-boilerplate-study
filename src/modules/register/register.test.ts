import { request } from "graphql-request"

import { startServer } from "../../startServer"
import { User } from "../../entity/User"
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from "./errorMessage"

// GraphQL test
let getHost = () => ""

beforeAll(async () => {
    const app = await startServer()
    const { port } = app.address()
    getHost = () => `http://127.0.0.1:${ port }`
})
//

const email = "test@test.com"
const password = "test123"

const mutation = (e: string, p: string) => `
    mutation {
        register(email: "${e}", password: "${p}") {
            path
            message
        }
    }
`

describe("Register user", () => {

    test("Check if can register a user", async () => {
        const response = await request(getHost(), mutation(email, password))
        expect(response).toEqual({ register: null })

        const users = await User.find({ where: { email } })
        expect(users).toHaveLength(1)

        const user = users[0]
        expect(user.email).toEqual(email)
        expect(user.password).not.toEqual(password)
    })

    test("Check for duplicate emails", async () => {
        const response2: any = await request(getHost(), mutation(email, password))
        expect(response2.register).toHaveLength(1)
        expect(response2.register[0]).toEqual({
            path: "email",
            message: duplicateEmail
        })
    })

    test("Check bad email", async () => {
        const response3: any = await request(getHost(), mutation("b", password))
        expect(response3).toEqual({
            register: [
                {
                    path: "email",
                    message: emailNotLongEnough
                }, 
                {
                    path: "email", 
                    message: invalidEmail
                }
            ]
        })
    })

    test("Check bad password", async () => {
        const response4: any = await request(getHost(), mutation(email, "12"))
        expect(response4).toEqual({
            register: [
                {
                    path: "password",
                    message: passwordNotLongEnough
                }
            ]
        })
    })

    test("Check bad password and email", async () => {
        const response5: any = await request(getHost(), mutation("b", "12"))
        expect(response5).toEqual({
            register: [
                {
                    path: "email",
                    message: emailNotLongEnough
                },
                {
                    path: "email",
                    message: invalidEmail
                },
                {
                    path: "password",
                    message: passwordNotLongEnough
                }
            ]
        })
    })
    
})
