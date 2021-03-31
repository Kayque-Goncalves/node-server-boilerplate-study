import { request } from "graphql-request"

import { Test } from "../../entity/User"
import { createTypeormConn } from "../../utils/createTypeormConnection"
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from "./errorMessage"
import { describe, expect, it } from "@jest/globals"

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

beforeAll(async () => {
    await createTypeormConn()
})

describe("Register user", () => {

    it("Check if can register a user", async () => {

        const response = await request(process.env.TEST_HOST as string, mutation(email, password))
        expect(response).toEqual({ register: null })

        const users = await Test.find({ where: { email } })
        expect(users).toHaveLength(1)

        const user = users[0]
        expect(user.email).toEqual(email)
        expect(user.password).not.toEqual(password)
    })

    it("Check for duplicate emails", async () => {
        const response2: any = await request(process.env.TEST_HOST as string, mutation(email, password))
        expect(response2.register).toHaveLength(1)
        expect(response2.register[0]).toEqual({
            path: "email",
            message: duplicateEmail
        })
    })

    it("Check bad email", async () => {
        const response3: any = await request(process.env.TEST_HOST as string, mutation("b", password))
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

    it("Check bad password", async () => {
        const response4: any = await request(process.env.TEST_HOST as string, mutation(email, "12"))
        expect(response4).toEqual({
            register: [
                {
                    path: "password",
                    message: passwordNotLongEnough
                }
            ]
        })
    })

    it("Check bad password and email", async () => {
        const response5: any = await request(process.env.TEST_HOST as string, mutation("b", "12"))
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
