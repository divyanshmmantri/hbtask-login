const mongoose=require('mongoose')
const validator=require('validator')

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true
})

const express=require('express')
const user_router=require('./routers/user.js')

const port=process.env.PORT

const app=express()
app.use(express.json())
app.use(user_router)




app.listen(port,()=>{
    console.log('server is set on '+port)
})
