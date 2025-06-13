import user from './modules/user.js'
import bcrypt from 'bcrypt'

const userRegister = async () => {
    try{
        const hashpassword = await bcrypt.hash("admn", 10)
        const newUser = new user({
            name: "Admn",
            email: "admin@gmail.com",
            password: hashpassword,
            role: "admin"
        })
        await newUser.save()
    } catch(error){
        console.log(error)
    }
}

userRegister();