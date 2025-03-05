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

export const defaultImageCloud = 
"https://res.cloudinary.com/dyjdubtia/image/upload/v1740098683/defaultProfileImage_uh9soq.jpg"

export const defaultPublicIdCloud = "defaultProfileImage_uh9soq"


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
  isDeleted: {
    type: Boolean,
    default: false
  },
  isBanned:{
    type:Boolean,
    default:false
  },
  deletedAt:Date,
  bannedAt:Date,
  updatedBy:{
    type:Types.ObjectId,
    ref:"User"
  },
  changeCredentialTime: Date,
  profilePic:{
    secure_url:{
        type:String,
        default: defaultImageCloud
    },
    public_id:{
        type:String,
        default: defaultPublicIdCloud
    }
  },
  coverPic:{
    secure_url:{
        type:String,
        default: defaultPublicIdCloud
    },
    public_id:{
        type:String,
        default: defaultPublicIdCloud
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

    },
  ],

   
},{timestamps:true, toJSON:{virtuals:true} , toObject:{virtuals:true}})

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.id;  
    return ret;
  },
});

userSchema.virtual('userName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
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

userSchema.post('find',{document:true , query:false}, function (docs) {
  docs.forEach((doc) => {
    if (doc.mobileNumber) {
      doc.mobileNumber = decrypt({encrypted:doc.mobileNumber,signature:process.env.ENCRYPTION_SECRET});
    }
  });
});

userSchema.post('findOne',{document:true , query:false}, function (doc) {
    if (doc.mobileNumber) {
      doc.mobileNumber = decrypt({encrypted:doc.mobileNumber,signature:process.env.ENCRYPTION_SECRET});
    }
  ;
});




export const UserModel = mongoose.models.User || model("User",userSchema)