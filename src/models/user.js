const mongoose=require('mongoose')
const validator=require('validator')
const User=mongoose.model('User',{
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
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
          minlength:7,
          validate(value){
              if(value.toLowerCase().includes('password'))
              {
                  throw new Error('password cannot contain password')
              }
          },
          trim:true,
    }
})