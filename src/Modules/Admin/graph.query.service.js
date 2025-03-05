import { CompanyModel } from "../../DB/Models/company.model.js";
import { UserModel } from "../../DB/Models/user.model.js";

export const getAllPostsAndCompanys = async (req, res, next) => {
          const users = await UserModel.find({ isDeleted: false });
          const companies = await CompanyModel.find({ isDeleted: false });
          return {
            message: 'Data fetched successfully',
            statusCode: '200',
            users,
            companies,
          };
}