import { JobOpportunityModel } from "../../DB/Models/jobOpportunity.model.js"
import * as dbService from "../../DB/dbService.js"
import { CompanyModel } from "../../DB/Models/company.model.js"
import { ApplicationModel } from "../../DB/Models/application.model.js";
import nodemailer from "nodemailer";

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
            populate: [{ path: 'company', select: 'HRs' }] // Get the HRs from the related company
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
    try {
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

    } catch (error) {
        next(error);
    }
};

/*
export const getJobApplications = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { page = 1, limit = 10, sort = 'createdAt' } = req.query;

        // Ensure page and limit are numbers
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // Find the job and populate its company details
        const job = await dbService.findOne({
            model: JobOpportunityModel,
            filter: { _id: jobId },
            populate: [{ path: 'company', select: 'createdBy HRs' }],
        });

        if (!job) {
            return next(new Error("Job not found", { cause: 404 }));
        }

        // Authorization: check if the user is a company owner or HR
        const { createdBy, HRs } = job.company;
        const isOwner = createdBy?.toString() === req.user._id?.toString();
        const isHR = HRs?.some(hrId => hrId.toString() === req.user._id?.toString());

        if (!isOwner && !isHR) {
            return next(new Error("You are not authorized to view applications for this job", { cause: 403 }));
        }

        // Get applications with user data populated
        const applications = await ApplicationModel.find({ jobId })
            .populate('userId', 'userName email profilePic')
            .sort({ [sort]: -1 })
            .skip(skip)
            .limit(limitNumber);

        // Count total applications for pagination
        const totalItems = await ApplicationModel.countDocuments({ jobId });

        const pagination = {
            totalItems,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalItems / limitNumber),
            itemsPerPage: applications.length,
        };

        return res.status(200).json({
            success: true,
            data: {
                applications,
                pagination,
            },
        });
    } catch (error) {
        next(error);
    }
};
*/

/*
export const updateApplicationStatus = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            return next(new Error("Invalid status. Must be 'accepted' or 'rejected'.", { cause: 400 }));
        }

        // Find the application with job and user details
        const application = await dbService.findOne({
            model: ApplicationModel,
            filter: { _id: applicationId },
            populate: [{ path: 'jobId', populate: { path: 'company' } }, { path: 'userId' }]
        });

        if (!application) {
            return next(new Error("Application not found", { cause: 404 }));
        }

        const { jobId, userId } = application;
        const company = jobId.company;

        // Ensure only company owner or HR can update the status
        const isOwner = company.createdBy.toString() === req.user._id.toString();
        const isHR = company.HRs.some(hrId => hrId.toString() === req.user._id.toString());

        if (!isOwner && !isHR) {
            return next(new Error("You are not authorized to update this application's status", { cause: 403 }));
        }

        // Update application status
        application.status = status;
        await application.save();

        // Send email notification to applicant
        const subject = status === 'accepted' ? "Job Application Accepted" : "Job Application Rejected";
        const message = status === 'accepted'
            ? `Congratulations! Your application for the position of ${jobId.jobTitle} has been accepted.`
            : `We regret to inform you that your application for the position of ${jobId.jobTitle} has been rejected.`;

        await sendEmail(userId.email, subject, message);

        return res.status(200).json({
            success: true,
            message: `Application ${status} successfully.`,
            data: { application }
        });

    } catch (error) {
        next(error);
    }
};

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    });
};

*/