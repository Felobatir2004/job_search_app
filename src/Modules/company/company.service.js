import { CompanyModel, defaultImageCloud, defaultPublicIdCloud } from "../../DB/Models/company.model.js";
import { roleType } from "../../DB/Models/user.model.js";
import * as dbService from "../../DB/dbService.js"
import cloudinary from "../../utils/fileUploading/cloudinaryConfig.js";

export const addCompany = async (req, res, next) => {
    const { companyName, companyEmail } = req.body;

    const checkCompanyName = await dbService.findOne({model: CompanyModel , filter: {companyName}})

    if(checkCompanyName) return next(new Error("Company name already exist", {cause: 409}))

    const checkCompanyEmail = await dbService.findOne({model: CompanyModel , filter: {companyEmail}})

    if(checkCompanyEmail) return next(new Error("Company email already exist", {cause: 409}))


    const company = await dbService.create({model: CompanyModel , data: {...req.body , createdBy: req.user._id}})

    return res.status(201).json({ success: true, message: "Company added successfully", data: { company }  })

};

export const updateCompany = async (req, res, next) => 
    {
    
        const { companyId } = req.params;
        const userId = req.user._id; 
        const updateData = req.body;


        if (updateData.legalAttachment) {
            delete updateData.legalAttachment;
        }
        const companyName = updateData.companyName;
        const companyEmail = updateData.companyEmail

        const checkCompanyName = await dbService.findOne({model: CompanyModel , filter: {companyName}})

        if(checkCompanyName) return next(new Error("Company name already exist", {cause: 409}))
    
        const checkCompanyEmail = await dbService.findOne({model: CompanyModel , filter: {companyEmail}})
    
        if(checkCompanyEmail) return next(new Error("Company email already exist", {cause: 409}))
    
    
        const company = await dbService.findById({
            model: CompanyModel,
            id: companyId
        });

        if (!company) {
            return next(new Error("Company not found", { cause: 404 }));
        }

        if (company.createdBy.toString() !== userId.toString()) {
            return next(new Error("You are not authorized to update this company", { cause: 403 }));
        }

        Object.assign(company, updateData);
        await company.save();

        return res.status(200).json({
            success: true,
            message: "Company updated successfully",
            data: company
        });
}

export const softDelete = async (req, res, next) => {
    const {companyId} = req.params;

    const deleteCompany = await dbService.findById({
        model:CompanyModel,
        id:{_id:companyId }
    });
    if(!deleteCompany) return next(new Error("company not found",{cause:404}))
    
    if(deleteCompany.createdBy.toString() === req.user._id.toString() ||req.user.role === roleType.Admin) 
    {
        deleteCompany.isDeleted = true;
        deleteCompany.deletedAt = Date.now();
        await deleteCompany.save()
        return res.status(200).json({success:true , data:{deleteCompany}})
    }
    else{
        return next(new Error("You are not authorized to delete this user",{cause:401}))
    }

}

export const searchComapnyWithName = async (req, res, next) => {
    const {companyName} = req.body;

    const company = await dbService.findOne({model: CompanyModel , filter: {companyName:companyName}})
    
    if(!company) return next(new Error("Company not found", { cause: 404 }));

    return res.status(200).json({ success: true, data: { company } });
}

export const uploadlogo = async (req, res, next) => {
    const {companyId} = req.params;
    const company = await dbService.findByIdAndUpdate({
        model:CompanyModel,
        id:{_id:companyId},
    })
    if(company.createdBy.toString() !== req.user._id.toString())
         return next(new Error("You are not authorized to update this company", { cause: 403 }));
    
    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
        folder: `Company/${company._id}/logo`,
    })
    company.logo = {secure_url , public_id}
    await company.save()

    return res.status(200).json({success:true,data:{company}})
};
  
export const uploadCover = async (req, res, next) => {
    const {companyId} = req.params;
    const company = await dbService.findByIdAndUpdate({
        model:CompanyModel,
        id:{_id:companyId},
    })
    if(company.createdBy.toString() !== req.user._id.toString())
         return next(new Error("You are not authorized to update this company", { cause: 403 }));
    
    const {secure_url , public_id} = await cloudinary.uploader.upload(req.file.path,{
        folder: `Company/${company._id}/Cover`,
    })
    company.coverPic = {secure_url , public_id}
    await company.save()

    return res.status(200).json({success:true,data:{company}})
};
  
export const deleteLogo = async (req,res,next) =>{
    const {companyId} = req.params;

    const company = await dbService.findByIdAndUpdate({
        model:CompanyModel,
        id:{_id:companyId},
    })
    if(company.createdBy.toString() !== req.user._id.toString())
        return next(new Error("You are not authorized to update this company", { cause: 403 }));
   
    const results = await cloudinary.uploader.destroy(company.logo.public_id)

    if(results.result === "ok")
    {
       company.logo = {
           secure_url : defaultImageCloud,
           public_id : defaultPublicIdCloud
       }
    }
    await company.save()

    return res.status(200).json({success:true,data:{company}})
}

export const deleteCover = async (req,res,next) =>{
    const {companyId} = req.params;

    const company = await dbService.findByIdAndUpdate({
        model:CompanyModel,
        id:{_id:companyId},
    })
    if(company.createdBy.toString() !== req.user._id.toString())
        return next(new Error("You are not authorized to update this company", { cause: 403 }));
   
    const results = await cloudinary.uploader.destroy(company.coverPic.public_id)

    if(results.result === "ok")
    {
       company.coverPic = {
           secure_url : defaultImageCloud,
           public_id : defaultPublicIdCloud
       }
    }
    await company.save()

    return res.status(200).json({success:true,data:{company}})
}

