import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql"
import * as adminController from "./Admin/admin.graph.controller.js"
export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name:"jobSearchAppQuery",
        description:"main application query",
        fields:{
            ...adminController.query,
        }
    }),
/*
    mutation: new GraphQLObjectType({
        name:"jobSearchAppMutation",
        description:"main application mutation",
        fields:{ 
            ...adminController.mutation,
        }
    })
*/
})


