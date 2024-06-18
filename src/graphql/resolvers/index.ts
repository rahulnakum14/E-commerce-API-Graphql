import { mergeResolvers } from '@graphql-tools/merge';
import userResolvers from './user.resolver';
import productResolvers from './product.resolver';
import cartResolvers from './cart.resolver';
import paymentResolvers from './payment.resolver';

const resolvers = mergeResolvers([userResolvers, productResolvers,cartResolvers,paymentResolvers]);

export default resolvers;

/* Working Way */

// import userResolvers from './user.resolver';
// import productResolvers from "./product.resolver";

// const resolvers = {
//   Query: {
//     ...userResolvers.Query,
//     ...productResolvers.Query
//   },
//   Mutation: {
//     ...userResolvers.Mutation,
//     ...productResolvers.Mutation
//   },
// };

// export default resolvers;

/**Old Way */

// import { mergeResolvers } from "@graphql-tools/merge";
// import { loadFilesSync } from "@graphql-tools/load-files";
// import path from "path";

// const resolversArray = loadFilesSync(path.join(__dirname, "./"), {
//   extensions: ["ts"],
// });
// const resolvers = mergeResolvers(resolversArray);

// export default resolvers;

