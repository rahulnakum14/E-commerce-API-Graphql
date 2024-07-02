import { gql } from "@apollo/client";

export const VERIFY_EMAIL = gql`
  query VerifyEmail($signupToken: String!) {
    verifyEmail(signupToken: $signupToken) {
      success
      message
    }
  }
`;


export const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts {
      id
      product_name
      product_price
    }
  }
`;

export const GET_CART_DETAILS = gql`
  query GetCartDetails {
    getCartDetails {
      id
      total_price
      products {
        product_name
        quantity
        price
      }
    }
  }
`;

export const GET_PAYMENT_URL = gql`
  query GetPaymentUrl {
    getPaymentUrl {
      message
      PaymentUrl
      SessionId
      InvoiceId
    }
  }
`;
