import { ResolverMap } from "../../types/graphql-utils"
import * as bcrypt from 'bcryptjs'
import { User } from "../../entity/User"

export const resolvers: ResolverMap = { 
    Mutation: {
        register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {

            const userAlreadyExists = await User.findOne({
                where: { email },
                select: ["id"]
            })
            if (userAlreadyExists) {
                return [
                    {
                        path: "email",
                        message: "Already in use"
                    }
                ]
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const user = User.create({
                email,
                password: hashedPassword,
            })

            await user.save()
            return null
        }
    }
}