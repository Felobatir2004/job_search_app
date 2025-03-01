import mongoose,  {Schema , Types, model} from "mongoose";


const companySchema = new Schema({
    companyName:{
        type:String,
        required:true,
        minLength:[3,"first name must be at least 3 characters long"],
        maxLength:[20,"first name must be at most 20 characters long"],
        unique:[true,"company name already exist"],
        trim:true
    },
    description:{
        type:String,
        minLength:2,
        maxLength:5000,
        required:true,
    },
    industry:{
        type:String,
        required:true,
    },
    address:{
        type:String,
    },
    numberOfEmployees: {
        type:String,
        required:true,
        validate: {
            validator: function (value) {
              return /^\d+-\d+$/.test(value); // Matches format like "11-20"
            },
            message: 'Number of employees must be in range format like "11-20".',
          },
      
    },
    companyEmail:{
        type:String,
        required:true,
        unique:[true,"company email already exist"],
        lowercase:true,
        trim:true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address.'],
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    logo:{
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
    HRs:{
        type:[Types.ObjectId],
        ref:"User"
    },
    bannedAt:Date,
    deletedAt:Date,
    legalAttachment:{
        secure_url:{
            type:String,
        },
        public_id:{
            type:String,
        }
    },
    approvedByAdmin:{
        type:Boolean,
        default:false
    }


},{timestamps:true})

companySchema.pre('findOneAndDelete', async function (next) {
    const companyId = this.getQuery()._id;
    console.log(`Deleting related data for company ${companyId}`);
    next();
  });
export const CompanyModel = mongoose.models.Company || model("Company",companySchema)