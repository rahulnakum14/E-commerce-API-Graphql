import { rule, shield, allow, and, or } from "graphql-shield";

const isAuthenticated = rule()(async (parent, args, context, info) => {
  return context.user !== null;
});

const isAdmin = rule()(async (parent, args, context, info) => {
  return context.user.role === "admin";
});

const permissions = shield(
  {
    Query: {
      getUsers: and(isAuthenticated, isAdmin),
      getProducts: isAuthenticated
    },
    Mutation: {
      loginUser: allow,
      registerUser: allow,

      createProduct: and(isAuthenticated, isAdmin),
      updateProduct: and(isAuthenticated, isAdmin),
      deleteProduct: and(isAuthenticated, isAdmin),
    },
  },
  {
//     // Options
    allowExternalErrors: true, // Allows errors to be exposed to the client
    fallbackRule: allow, // Fallback rule is to allow
    fallbackError: "Not Authorized.", // Custom error message for fallback
  }
);

export default permissions;
