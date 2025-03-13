import mongoose from 'mongoose'
const adminSchema=new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true,
        },
        name:{
            type:String,
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
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
   },
    {timestamps:true},
);
const Admin=mongoose.model('Admin',adminSchema);
export default Admin;