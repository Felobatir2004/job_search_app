import mongoose,  {Schema , Types, model} from "mongoose";

export const jobLocation = {
    onsite:"onsite",
    remotely:"remotely",
    hybrid:"hybrid"
}

export const workingTime = {
    partTime:"partTime",
    fullTime:"fullTime"
}
export const seniorityLevel = {
    fresh:"fresh",
    junior:"junior",
    mid:"mid",
    senior:"senior",
    team_lead:"team_lead",
    CTO:"CTO"
}

const jobOpportunitySchema = new Schema({
    jobTitle:{
        type:String,
        required:true,
        trim:true,
    },
    jobLocation :{
        type:String,
        required:true,
        enum:Object.values(jobLocation),
        default:jobLocation.onsite
    },
    workingTime :{
        type:String,
        required:true,
        enum:Object.values(workingTime),
        default:workingTime.fullTime
    },
    seniorityLevel :{
        type:String,
        required:true,
        enum:Object.values(seniorityLevel),
        default:seniorityLevel.fresh
    },
    jobDescription:{
        type:String,
        required:true,
    },
    technicalSkills: {
        type: [String],
        required: true,
    },
    softSkills: {
        type: [String],
        required: true,
    },
    addBy:{
        type:Types.ObjectId,
        ref:"User",
        required:true
    },
    updatedBy:{
        type:Types.ObjectId,
        ref:"User",
    },
    closed:{
        type:Boolean,
        default:false
    },
    company: {
        type: Types.ObjectId,
        ref: "Company",
        required: true
    }
},{timestamps:true})
jobOpportunitySchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update && update.updatedBy) {
      this.set({ updatedAt: new Date() });
    }
    next();
  });
  
  jobOpportunitySchema.pre('findOneAndDelete', async function (next) {
    const jobId = this.getQuery()._id;
    console.log(`Deleting related data for job ${jobId}`);
    next();
  });

  jobOpportunitySchema.query.paginate = async function(page, limit = 10) {
    page = page ? parseInt(page) : 1;
    const skip = (page - 1) * limit;

    const data = await this.skip(skip).limit(limit);
    const totalItems = await this.model.countDocuments(this.getFilter());

    return {
        data,
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        itemsPerPage: data.length
    };
};


export const JobOpportunityModel = mongoose.models.JobOpportunity || model("JobOpportunity",jobOpportunitySchema)