/**
 * Imports necessary functions from graphql-shield for authorization rule creation.
 * 
 * @typedef {import('graphql-shield').Rule} Rule
 * @typedef {import('graphql-shield').ShieldFunction} ShieldFunction
 * 
 * @type {Rule}
 * @type {ShieldFunction}
 */
import { rule, shield, allow, and, or } from "graphql-shield";

/**
 * Defines a rule to check if the user is authenticated based on context.
 * 
 * @type {Rule}
 */
const isAuthenticated = rule()(async (parent, args, context, info) => {
  return context.user !== null;
});

/**
 * Defines a rule to check if the user has the "admin" role based on context.
 * 
 * @type {Rule}
 */
const isAdmin = rule()(async (parent, args, context, info) => {
  return context.user && context.user.role === "admin";
});

/**
 * Defines a rule to check if the user has the "customer" role based on context.
 * 
 * @type {Rule}
 */
const isCustomer = rule()(async (parent, args, context, info) => {
  return context.user && context.user.role === "customer";
});

/**
 * Combines rules and defines permissions for each GraphQL operation using shield.
 * 
 * @type {ShieldFunction}
 */
const permissions = shield(
  {
    Query: {
      getUsers: and(isAuthenticated, isAdmin),
      getProducts: and(isAuthenticated, or(isAdmin, isCustomer)),
      getCartDetails: and(isAuthenticated, or(isAdmin, isCustomer)),
      getPaymentUrl: and(isAuthenticated, or(isAdmin, isCustomer)),
    },
    Mutation: {
      // Login and Register modules are publicly accessible (allowed)
      loginUser: allow,
      registerUser: allow,

      // Admin module requires authentication and admin role
      createProduct: and(isAuthenticated, isAdmin),
      updateProduct: and(isAuthenticated, isAdmin),
      deleteProduct: and(isAuthenticated, isAdmin),

      // Cart module requires authentication and either admin or customer role
      addProductCart: and(isAuthenticated, or(isAdmin, isCustomer)),
      removeProductCart: and(isAuthenticated, or(isAdmin, isCustomer)),
    },
  },
  {
    // Options
    allowExternalErrors: true, // Allows errors to be exposed to the client
    fallbackRule: allow, // Fallback rule is to allow
    fallbackError: "Not Authorized.", // Custom error message for fallback
  }
);

export default permissions;
