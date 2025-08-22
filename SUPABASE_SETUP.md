# Supabase Authentication Setup

This guide explains how Supabase authentication has been set up in your expense tracking app.

## What's Been Set Up

### 1. Dependencies Installed
- `@supabase/supabase-js` - Supabase JavaScript client
- `@react-native-async-storage/async-storage` - For persistent authentication state

### 2. Configuration Files
- `lib/supabase.ts` - Supabase client configuration
- `.env` - Environment variables for Supabase URL and anon key
- `supabase/config.toml` - Local Supabase configuration

### 3. Database Schema
- `supabase/migrations/001_create_users_table.sql` - Creates profiles table with RLS policies
- Automatic profile creation when users sign up
- Row Level Security (RLS) enabled for data protection

### 4. Authentication Context
- `contexts/AuthContext.tsx` - Updated to use real Supabase authentication
- Handles sign in, sign up, sign out, and session management
- Automatic session persistence and refresh

### 5. Utility Functions
- `lib/supabase-utils.ts` - Helper functions for common Supabase operations

## How to Use

### Starting the Local Supabase Instance
```bash
npx supabase start
```

### Resetting the Database (if needed)
```bash
npx supabase db reset
```

### Accessing Supabase Studio
Open http://127.0.0.1:54333 in your browser to access the Supabase dashboard.

## Authentication Flow

1. **Sign Up**: Users create accounts with email, password, and name
2. **Email Verification**: Users receive verification emails (configured in Supabase)
3. **Sign In**: Users authenticate with email and password
4. **Session Management**: Automatic token refresh and persistence
5. **Sign Out**: Users can sign out and clear their session

## Security Features

- Row Level Security (RLS) on user profiles
- JWT-based authentication
- Secure password requirements (minimum 6 characters)
- Automatic session management
- Protected API endpoints

## Environment Variables

The app uses these environment variables:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Testing Authentication

1. Start the local Supabase instance
2. Run the app with `npm start`
3. Navigate to the sign-up screen
4. Create a test account
5. Verify the account in Supabase Studio
6. Test sign-in functionality

## Next Steps

- Configure email templates in Supabase
- Add password reset functionality
- Implement social authentication (Google, Apple, etc.)
- Add multi-factor authentication
- Set up user profile management
