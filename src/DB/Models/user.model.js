import mongoose,  {Schema , Types, model} from "mongoose";
import { hash } from "../../utils/hashing/hash.js";
import { decrypt, encrypt } from "../../utils/encryption/encryption.js";


export const genderType= {
    male: "male",
    female: "female"
}

export const roleType= {
    superAdmin: "superAdmin",
    User: "User",
    Admin: "Admin"
}

export const providersTypes = {
    Google:"Google",
    System:"System"
}

export const OTPType = {
    confirmEmail:"confirmEmail",
    forgetPassword:"forgetPassword"
}

const userSchema = new Schema({
   firstName: {
    type:String,
    required:true,
    minLength:[3,"first name must be at least 3 characters long"],
    maxLength:[20,"first name must be at most 20 characters long"],
    trim : true,
   },
   lastName: {
    type:String,
    required:true,
    minLength:[3,"last name must be at least 3 characters long"],
    maxLength:[20,"last name must be at most 20 characters long"],
    trim : true,
   },
   email:{
    type:String,
    required:[true,"email is required"],
    unique:[true,"email must be unique"],
    lowercase:true,
    trim : true,
   },
   password: {
    type:String,
    minLength:[6,"password must be at least 6 characters long"],
    required:[true,"password is required"],
   },
   providers:{
    type:String,
    enum:Object.values(providersTypes),
    default:providersTypes.System
   },
   gender:{
    type:String,
    enum:Object.values(genderType),
    default:genderType.male
   },
   DOB: {
    type: Date,
    validate: {
      validator: function (value) {
        const age = new Date().getFullYear() - value.getFullYear();
        return age >= 18;
      },
      message: 'User must be at least 18 years old.',
    },
  },
  mobileNumber:String,
  role:{
    type:String,
    enum:Object.values(roleType),
    default:roleType.User
  },
  isConfirmed: {
    type: Boolean,
    default: false
  },
  deletedAt:Date,
  bannedAt:Date,
  uodatedBy:{
    type:Types.ObjectId,
    ref:"User"
  },
  changeCredentialTime: Date,
  profilePic:{
    secure_url:{
        type:String,
    },
    public_id:{
        type:String,
    }
  },
  coverPic:{
    secure_url:{
        type:String,
    },
    public_id:{
        type:String,
    }
  },
  OTP: [
    {
      OTPtype: {
        type: String,
        enum: Object.values(OTPType),
      },
      code: String,
      expiresIn: Date,
      _id:false
    },
  ],

   
},{timestamps:true})

userSchema.virtual('userName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.pre("save",function(next){

    if(this.isModified("password")) 
    {
        this.password = hash({plainText:this.password})
    }
    return next()
})

userSchema.pre("save",function(next){

  if(this.isModified("mobileNumber")) 
  {
      this.mobileNumber = encrypt({plainText:this.mobileNumber, signature:process.env.ENCRYPTION_SECRET})
  }
  return next()
})

userSchema.post('find', function (docs) {
  docs.forEach((doc) => {
    if (doc.mobileNumber) {
      doc.mobileNumber = decrypt({encrypted:doc.mobileNumber,signature:process.env.ENCRYPTION_SECRET});
    }
  });
});

export const UserModel = mongoose.models.User || model("User",userSchema)