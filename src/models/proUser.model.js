import mongoose from "mongoose";
const ProUserSchema=new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true
        },
        name:{
            type:String,
        },
        tel:{
            type:String,
            maxlength:8,
        },
        bankAccount:{
            type:String,
            unique:true,
        },
        password:{
            type:String,
            required:true,
            minlength:6,
        },
        lastLogin: {
			type: Date,
			default: Date.now,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
        role: {
            type: String,
            enum: ["user", "admin", "proUser"],
            default: "user",
          },
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,

    
    },
    {timestamps:true},
    
);
const ProUser=mongoose.model('ProUser',ProUserSchema);
export default ProUser;