const express=require('express')
const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true
})

const router=new express.Router()
const user_schema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error('email is invalid')
            }
        }

    },
    password:{
          type:String,
          required:true,
          minlength:8,
          validate(value){
              if(value.toLowerCase().includes('password'))
              {
                  throw new Error('password cannot contain password')
              }
          },
          trim:true,
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
    
    

   
})

//methods used for instances
user_schema.methods.generateAuth=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    console.log(token)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}
// statics is used for models
user_schema.statics.findBylogin=async (email,password)=>{
    const user=await User.findOne({email:email})
    if(!user)
    {
        throw new Error('Unable to login')
    }
    const match=await bcrypt.compare(password,user.password)
    if(!match)
    {
        throw new Error('Unable to login')
    }
    return user
}


    

user_schema.pre('save',async function(next){
    // this -it provides access to the each user that is saved
    const user=this
    if(user.isModified('password'))
    {
    user.password=await bcrypt.hash(user.password,8)
    }
    next()
})
const User=mongoose.model('User',user_schema)
router.post('/users',async (req,res)=>{
    
    try{
    const new_user=new User(req.body)
    await new_user.save()
    const token=await new_user.generateAuth()
    res.send({new_user,token})
    }
    catch(error){
          res.status(400).send()
    }
})
router.post('/users/login',async (req,res)=>{
    try{

    
    const user=await User.findBylogin(req.body.email,req.body.password)
    const token=await user.generateAuth()

    res.send({user,token})
    }
    catch(error)
    {
          res.status(400).send()
    }
    
    
})
router.get('/users',(req,res)=>{
    User.find({}).then((users)=>{
           res.send(users)
    }).catch((error)=>{
        res.status(500).send()
    })
})
router.get('/users/:id',(req,res)=>{
    const _id=req.params.id
    User.findById(_id).then((users)=>{
        res.send(users)
    }).catch((error)=>{
        res.status(400).send(error)
    })
})
router.get('/users_name',(req,res)=>{
       
    User.findOne({name:req.body.name}).then((users)=>{
        res.send(users)
    }).catch((error)=>{
        res.send(error)
    })
})
router.patch('/users/:id',async(req,res)=>{
    const updates=Object.keys(req.body)
    const update_b=['name','email','password']
    const validate_u=updates.every((update)=>{
        return update_b.includes(update)
    })

        
    if(!validate_u)
    {
       return  res.status(400).send({
            error:'invalid update'
        })
    }
    
    try
    {
      const user_update=await User.findById(req.params.id)
      updates.forEach((update)=>{
          user_update[update]=req.body[update]
      }) 
      await user_update.save()
    //const user_update=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
      res.status(201).send(user_update)
    }
    catch(error)
    {
        res.status(400).send(error) 
    }

})
router.delete('/users/:id',async (req,res)=>{
    const user_del=await User.findByIdAndDelete(req.params.id)
    try{
        res.status(201).send(user_del)
    }
    catch(error){
          res.send(error)
    }
})
module.exports=router

