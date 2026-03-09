'use client';

import { signIn, signOut, signUp, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

export interface SignUpParams {
  email: string;
  password: string;
  name?: string;
}

export interface SignInParams {
  username: string; // Can be email or username
  password: string;
}

export interface ConfirmSignUpParams {
  username: string;
  confirmationCode: string;
}

export interface ResetPasswordParams {
  username: string;
}

export interface ConfirmResetPasswordParams {
  username: string;
  confirmationCode: string;
  newPassword: string;
}

class AuthService {
  async signUp({ email, password, name }: SignUpParams) {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: name || email.split('@')[0],
          },
        },
      });

      return {
        success: true,
        userId,
        isSignUpComplete,
        nextStep,
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign up',
      };
    }
  }

  async confirmSignUp({ username, confirmationCode }: ConfirmSignUpParams) {
    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username,
        confirmationCode,
      });

      return {
        success: true,
        isSignUpComplete,
        nextStep,
      };
    } catch (error: any) {
      console.error('Confirm sign up error:', error);
      return {
        success: false,
        error: error.message || 'Failed to confirm sign up',
      };
    }
  }

  async resendConfirmationCode(username: string) {
    try {
      const result = await resendSignUpCode({ username });
      return {
        success: true,
        result,
      };
    } catch (error: any) {
      console.error('Resend code error:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend confirmation code',
      };
    }
  }

  async signIn({ username, password }: SignInParams) {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username,
        password,
      });

      if (isSignedIn) {
        // Get the session to retrieve tokens
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        const accessToken = session.tokens?.accessToken?.toString();

        return {
          success: true,
          isSignedIn,
          tokens: {
            idToken,
            accessToken,
          },
        };
      }

      return {
        success: true,
        isSignedIn,
        nextStep,
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in',
      };
    }
  }

  async signOut() {
    try {
      await signOut();
      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign out',
      };
    }
  }

  async resetPassword({ username }: ResetPasswordParams) {
    try {
      const result = await resetPassword({ username });
      return {
        success: true,
        result,
      };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reset password',
      };
    }
  }

  async confirmResetPassword({ username, confirmationCode, newPassword }: ConfirmResetPasswordParams) {
    try {
      await confirmResetPassword({
        username,
        confirmationCode,
        newPassword,
      });
      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Confirm reset password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to confirm password reset',
      };
    }
  }

  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      return {
        success: true,
        user,
      };
    } catch (error: any) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: error.message || 'No authenticated user',
      };
    }
  }

  async getSession() {
    try {
      const session = await fetchAuthSession();
      return {
        success: true,
        session,
      };
    } catch (error: any) {
      console.error('Get session error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get session',
      };
    }
  }
}

export const authService = new AuthService();