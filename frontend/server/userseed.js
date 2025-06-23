import user from './models/user.js'  // Changed from './modules/user.js' to './models/user.js'
import bcrypt from 'bcrypt'
import connectToDatabase from './db/db.js'

const userRegister = async () => {
    await connectToDatabase()  // Added await here for better error handling
    try{
        const hashpassword = await bcrypt.hash("admn", 10)
        const newUser = new user({
            name: "Admn",
            email: "admin@gmail.com",
            password: hashpassword,
            role: "admin"
        })
        await newUser.save()
        console.log("Admin user created successfully!")
        process.exit(0)  // Exit the process after successful creation
    } catch(error){
        console.log("Error creating user:", error)
        process.exit(1)  // Exit with error code
    }
}

userRegister();