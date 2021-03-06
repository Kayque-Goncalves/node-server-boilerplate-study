import { ResolverMap } from "../../types/graphql-utils"
import * as yup from "yup"
import * as bcrypt from 'bcryptjs'

import { Test } from "../../entity/User"
import { formatYupError } from "../../utils/formatYupErrors"
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from "./errorMessage"
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink"

const schema = yup.object().shape({
    email: yup.string().min(3, emailNotLongEnough).max(255).email(invalidEmail),
    password: yup.string().min(3, passwordNotLongEnough).max(255)
})

export const resolvers: ResolverMap = { 
    Mutation: {
        register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
            try {
                await schema.validate(args, { abortEarly: false })
            } catch (err) {
                return formatYupError(err)
            }

            const { email, password } = args
            
            const userAlreadyExists = await Test.findOne({
                where: { email },
                select: ["id"]
            })
            if (userAlreadyExists) {
                return [
                    {
                        path: "email",
                        message: duplicateEmail
                    }
                ]
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const user = Test.create({
                email,
                password: hashedPassword,
            })

            await user.save()

            await createConfirmEmailLink(url, user.id, redis)

            return null
        }
    }
}
