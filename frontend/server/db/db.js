import mongoose from "mongoose";

const connectToDatabase = async () => {
    try{
        await mongoose.connect()
    } catch(error){
        console.log(error)
    }
}