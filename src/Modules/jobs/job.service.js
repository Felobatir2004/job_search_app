import { JobOpportunityModel } from "../../DB/Models/jobOpportunity.model.js"
import * as dbService from "../../DB/dbService.js"
import { CompanyModel } from "../../DB/Models/company.model.js"
import { ApplicationModel } from "../../DB/Models/application.model.js";
import nodemailer from "nodemailer";
import {sendEmail} from "../../utils/email/applicationEmail.js"
import cloudinary from "../../utils/fileUploading/cloudinaryConfig.js";
export const createJob = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const {
            jobTitle,
            jobLocation,
            workingTime,
            seniorityLevel,
            jobDescription,
            technicalSkills,
            softSkills
        } = req.body;

        const company = await dbService.findById({
            model: CompanyModel,
            id: companyId,
            options: { populate: "HRs" } 
        });

        if (!company) {
            return next(new Error("Company not found", { cause: 404 }));
        }


        const isOwner = company.createdBy?.toString() === req.user._id?.toString();
        const isHR = company.HRs.some(hr => hr._id?.toString() === req.user._id?.toString());

        if (!isOwner && !isHR) {
            return next(new Error("You are not authorized to add jobs for this company", { cause: 403 }));
        }
        if(company.isBanned == true) 
            return next(new Error("Company is banned", { cause: 403 }));
        if(company.approvedByAdmin == false) 
            return next(new Error("Company is not approved by admin", { cause: 403 }));

        const job = await dbService.create({
            model: JobOpportunityModel,
            data: {
                jobTitle,
                jobLocation,
                workingTime,
                seniorityLevel,
                jobDescription,
                technicalSkills,
                softSkills,
                addBy: req.user._id,
                company: companyId
            }
        });

        return res.status(201).json({ 
            success: true, 
            message: "Job added successfully", 
            data: { job } 
        });

    } catch (error) {
        next(error);
    }
};

export const updateJob = async (req, res, next) => {
    const { jobId } = req.params;
    const updates = req.body;

    const job = await dbService.findById({
        model: JobOpportunityModel,
        id: jobId
    });

    if (!job) {
        return next(new Error("Job not found", { cause: 404 }));
    }

    if (job.addBy.toString() !== req.user._id.toString()) {
        return next(new Error("You are not authorized to update this job", { cause: 403 }));
    }

    const updatedJob = await dbService.findByIdAndUpdate({
        model: JobOpportunityModel,
        id: jobId,
        data: updates,
        options: { new: true }
    });

    return res.status(200).json({
        success: true,
        message: "Job updated successfully",
        data: { job: updatedJob }
    });
};

export const deleteJob = async (req, res, next) => {
        const { jobId } = req.params;

        const job = await dbService.findById({
            model: JobOpportunityModel,
            id: jobId,
            populate: [{ path: 'company', select: 'HRs' }] 
        });

        if (!job) {
            return next(new Error("Job not found", { cause: 404 }));
        }

        const isAuthorized = job.company.HRs.some(hr => hr._id?.toString() === req.user._id?.toString());
        
        if (!isAuthorized) {
            return next(new Error("You are not authorized to delete this job", { cause: 403 }));
        }

        await dbService.findByIdAndDelete({
            model: JobOpportunityModel,
            id: jobId
        });

        return res.status(200).json({
            success: true,
            message: "Job deleted successfully"
        });


}

export const getJobsForCompany = async (req, res, next) => {
        const { companyId, jobId } = req.params; // merge params
        const {  page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
        const { companyName } = req.body;

        let company;
        if (companyId) {
            company = await dbService.findById({ model: CompanyModel, id: companyId });
        } else if (companyName) {
            company = await dbService.findOne({
                model: CompanyModel,
                filter: { companyName: { $regex: companyName, $options: 'i' } }
            });
        }

        const companyjobs = await CompanyModel.findById(companyId).populate('jobs');
        


        if (!company) {
            return next(new Error("Company not found", { cause: 404 }));
        }

        const jobQuery = JobOpportunityModel.find({ company: company._id });
        if (jobId) jobQuery.find({ _id: jobId });

        jobQuery.sort({ [sort]: order === 'asc' ? 1 : -1 });

        const result = await jobQuery.paginate(page, limit);

        return res.status(200).json({
            success: true,
            data: {
                company: company.companyName,
                jobs:companyjobs.jobs ,
                pagination: {
                    totalItems: result.totalItems,
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    itemsPerPage: result.itemsPerPage
                }
            }
        });


};

export const getAllJobs = async (req, res, next) => {
        const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = req.query;
        const filters = {};

        const filterableFields = ["workingTime", "jobLocation", "seniorityLevel", "jobTitle", "technicalSkills"];
        filterableFields.forEach(field => {
            if (req.query[field]) {
                filters[field] = { $regex: req.query[field], $options: "i" }; 
            }
        });

        const skip = (page - 1) * limit;

        const jobs = await dbService.find({
            model: JobOpportunityModel,
            filter: filters,
            options: {
                skip: parseInt(skip),
                limit: parseInt(limit),
                sort: { [sort]: order === "asc" ? 1 : -1 }
            }
        });

        const totalItems = await JobOpportunityModel.countDocuments(filters)
        res.status(200).json({
            success: true,
            data: {
                jobs,
                pagination: {
                    totalItems,
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalItems / limit),
                    itemsPerPage: jobs.length
                }
            }
        });
};


 export const getAllApplicationsForJob = async (req, res) => {
      const { jobId } = req.params;
      const { page = 1, limit = 10, sort = 'createdAt' } = req.query;
      const userId = req.user._id;
  
      const job = await JobOpportunityModel.findById(jobId).populate('company');
      if (!job) {
        return res.status(404).json({ message: 'Job not found.' });
      }
  
      const company = await CompanyModel.findById(job.company._id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found.' });
      }
  
      const isAuthorized = company.createdBy.equals(userId) || company.HRs.some(hr => hr._id?.toString() === req.user._id?.toString());
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Access denied. Only company owners or HR can view applications.' });
      }
  
      const skip = (page - 1) * limit;
  
      const applications = await ApplicationModel.find({ jobId })
        .populate({
          path: 'userId',
          select: 'firstName lastName userName email profilePic',
        })
        .sort({ [sort]: -1 })
        .skip(skip)
        .limit(parseInt(limit));
  
      const totalCount = await ApplicationModel.countDocuments({ jobId });
  
      res.status(200).json({
        message: 'Applications fetched successfully.',
        data: {
          applications,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
          },
        },
      });
  };
  

 export const applyToJob = async (req, res) => {
     const { jobId } = req.params;
     const userId = req.user?._id; 
     const userRole = req.user?.role;

 
     if (!userId || !userRole) {
       return res.status(401).json({ message: 'Unauthorized. Please log in.' });
     }
 
     if (userRole !== 'User') {
       return res.status(403).json({ message: 'Only users can apply for jobs.' });
     }
 
     const job = await JobOpportunityModel.findById(jobId);
     if (!job) {
       return res.status(404).json({ message: 'Job not found.' });
     }
 
     const existingApplication = await ApplicationModel.findOne({ jobId, userId });
     if (existingApplication) {
       return res.status(400).json({ message: 'You have already applied for this job.' });
     }
 
     if (!req.file || !req.file.path) {
       return res.status(400).json({ message: 'Please upload your CV.' });
     }
 
     const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
       folder: `jobs/Applications/${jobId}`, 
     });
 
     if (!cloudinaryResponse.secure_url || !cloudinaryResponse.public_id) {
       throw new Error('Failed to upload CV.');
     }
 
     const application = await ApplicationModel.create({
       jobId,
       userId,
       userCV: {
         secure_url: cloudinaryResponse.secure_url,
         public_id: cloudinaryResponse.public_id,
       },
       status: 'pending',
     });
 
     console.log('Application created:', application);
 
     return res.status(201).json({ message: 'Job application submitted successfully!', application });

 };
 



export const updateApplicationStatus = async (req, res) => {
    const { applicationId } = req.params;
    const { newStatus } = req.body; // 'accepted' or 'rejected'
    const userId = req.user._id; // Authenticated user's ID

    // Validate newStatus
    if (!['accepted', 'rejected'].includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status. Use 'accepted' or 'rejected'." });
    }

    // Find application and populate job -> company
    const application = await ApplicationModel.findById(applicationId)
      .populate({
        path: 'jobId',
        populate: {
          path: 'company',
          select: 'createdBy HRs',
        },
      })
      .populate('userId', ' firstName lastName email userName');

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const company = application.jobId.company;

    // Ensure the user is authorized (company owner or HR)
    const isAuthorized = company.createdBy.equals(userId) || company.HRs.some(hrId => hrId.equals(userId));
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied. Only company owners or HRs can update application status.' });
    }

    // Update application status
    application.status = newStatus;
    await application.save();

    // Send email to applicant
    const subject = newStatus === 'accepted' ? 'Congratulations! Your Job Application has been Accepted' : 'Job Application Update';
    const message = newStatus === 'accepted'
      ? `Dear ${application.userId.userName},\n\nCongratulations! We are pleased to inform you that your application for the position has been accepted.`
      : `Dear ${application.userId.userName},\n\nThank you for your interest in the position. Unfortunately, we have decided to move forward with other candidates at this time.`;

    await sendEmail(application.userId.email, subject, message);

    res.status(200).json({ message: `Application has been ${newStatus}.`, application });

};