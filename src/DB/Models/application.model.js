import mongoose, { model, Schema, Types } from "mongoose";

export const status = {
  pending: 'pending',
  accepted: 'accepted',
  viewed: 'viewed',
  in_consideration: 'in consideration',
  rejected: 'rejected',
};

const applicationSchema = new Schema({
  jobId: {
    type: Types.ObjectId,
    ref: 'JobOpportunity',
    required: true,
  },
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userCV: {
    secure_url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  status: {
    type: String,
    enum: Object.values(status), // Corrected this line
    default: 'pending',
  },
}, { timestamps: true });


// Cascade delete applications if a related job is deleted
applicationSchema.pre('findOneAndDelete', async function (next) {
  const jobId = this.getQuery().jobId;
  console.log(`Deleting applications related to job: ${jobId}`);
  next();
});

export const ApplicationModel = mongoose.models.Application || model("Application",applicationSchema)
