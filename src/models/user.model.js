import mongoose from'mongoose'
import bcrypt from 'bcrypt';
const userSchema=new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true,
            
        },
        password:{
            type:String,
            required:true,
            minlength:6,
            select: false, 
            
        },
        role: {
            type: String,
            enum: ["user", "admin", "proUser"],
            default: "user",
          },
        lastLogin: {
			type: Date,
			default: Date.now,
		},
    bannedUntil: {
      type: Date, 
      default: null, 
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
//aawidha
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10); 
    }
    next();
  })
const User=mongoose.model('User',userSchema);
export default User;
