import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation LoginUser($username: String!, $password: String!) {
    loginUser(username: $username, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser(
    $username: String!
    $email: String!
    $password: String!
  ) {
    registerUser(username: $username, email: $email, password: $password) {
      success
      message
    }
  }
`;

export const VERIFY_PASSWORD = gql`
  mutation VeriFyForgotPassword(
    $forgotPasswordToken: String!
    $newPassword: String!
  ) {
    veriFyForgotPassword(
      forgotPasswordToken: $forgotPasswordToken
      newPassword: $newPassword
    ) {
      success
      message
    }
  }
`;

export const ADD_PRODUCT_CART = gql`
  mutation AddProductCart($product_id: String!, $quantity: String!) {
    addProductCart(product_id: $product_id, quantity: $quantity) {
      success
      message
      data {
        id
        total_price
        products {
          product_id
          quantity
          price
        }
      }
    }
  }
`;

export const FORGOT_PASSWORD = gql`
mutation ForgotPassword ($email: String!) {
    forgotPassword(email: $email) {
        success
    }
}
`;
