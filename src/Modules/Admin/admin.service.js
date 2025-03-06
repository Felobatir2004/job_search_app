import { CompanyModel } from "../../DB/Models/company.model.js";
import { UserModel } from "../../DB/Models/user.model.js";


export const banOrUnbanUser = async (req, res, next) => {
    const { userId } = req.params;


    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if(user.isBanned == false){
        user.isBanned = true;
        user.bannedAt = Date.now();
    }
    else{
        user.isBanned = false;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: "Done",
      user,
    });
};


export const banOrUnbanCompany = async (req, res, next) => {
    const { companyId } = req.params;


    const company = await CompanyModel.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: "company not found" });
    }
    if(company.isBanned == false){    
        company.isBanned = true;
        company.bannedAt = Date.now();
    }
    else{
        company.isBanned = false;
    }
    await company.save();

    res.status(200).json({
      success: true,
      message: `done`,
      company,
    });
};


export const approveCompany = async (req, res, next) => {
    const { companyId } = req.params; 
    const company = await CompanyModel.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

   if(company.approvedByAdmin == false)  
   {
    company.approvedByAdmin = true;
   }
   else{
    company.approvedByAdmin = false;
   }
    await company.save();

    res.status(200).json({
      success: true,
      message: `Done`,
      company,
    });
};
