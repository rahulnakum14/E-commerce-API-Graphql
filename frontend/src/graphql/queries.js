import { gql } from '@apollo/client';

export const VERIFY_EMAIL = gql`
  query VerifyEmail($signupToken: String!) {
    verifyEmail(signupToken: $signupToken) {
      success
      message
    }
  }
`;
