import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLID, GraphQLBoolean } from 'graphql';
import { UserModel } from '../../DB/Models/user.model.js';
import { CompanyModel } from '../../DB/Models/company.model.js';
import * as adminService from './graph.query.service.js'
export const query = {
  getAllUsersAndCompanies: {
    type: new GraphQLObjectType({
      name: 'getAllUsersAndCompanies',
      fields: {
        message: { type: GraphQLString },
        statusCode: { type: GraphQLString },
        users: {
          type: new GraphQLList(
            new GraphQLObjectType({
              name: 'UserResponse',
              fields: {
                _id: { type: GraphQLID },
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                email: { type: GraphQLString },
                mobileNumber: { type: GraphQLString },
                gender: { type: GraphQLString },
                role: { type: GraphQLString },
                isConfirmed: { type: GraphQLBoolean },
                isDeleted: { type: GraphQLBoolean },
              },
            })
          ),
        },
        companies: {
          type: new GraphQLList(
            new GraphQLObjectType({
              name: 'CompanyResponse',
              fields: {
                _id: { type: GraphQLID },
                companyName: { type: GraphQLString },
                description: { type: GraphQLString },
                industry: { type: GraphQLString },
                numberOfEmployees: { type: GraphQLString },
                companyEmail: { type: GraphQLString },
                approvedByAdmin: { type: GraphQLBoolean },
                isDeleted: { type: GraphQLBoolean },
              },
            })
          ),
        },
      },
    }),
    resolve: async () => {
      const users = await UserModel.find({ isDeleted: false });
      const companies = await CompanyModel.find({ isDeleted: false });
      return {
        message: 'Data fetched successfully',
        statusCode: '200',
        users,
        companies,
      };
    },
  },
};
