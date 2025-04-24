'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation } from '@tanstack/react-query';
import { setCookie } from 'cookies-next';
import { MailIcon, ShieldCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function WorkspaceInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { login } = useAuth();
  const [invitationDetails, setInvitationDetails] = useState<{
    email?: string;
    role?: string;
    workspaceName?: string;
    username?: string;
    needsPasswordChange?: boolean;
    userId?: string;
    workspaceId?: string;
  } | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Get the token from the URL
  const token = params.token as string;

  // Fetch invitation details
  useEffect(() => {
    const getInvitationDetails = async () => {
      try {
        setIsLoading(true);
        const response = await newRequest.get(`/workspaces/invite/verify/${token}`);
        setInvitationDetails({
          email: response.data.data.invitation.email,
          role: response.data.data.invitation.role,
          workspaceName: response.data.data.invitation.workspace.name,
          username: response.data.data.invitation.email.split('@')[0],
          needsPasswordChange: response.data.data.invitation.needsPasswordChange,
          userId: response.data.data.invitation.userId,
          workspaceId: response.data.data.invitation.workspace.id,
        });
        setError('');
      } catch (err) {
        console.error('Error fetching invitation details:', err);
        setError('Invalid or expired invitation link');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      getInvitationDetails();
    }
  }, [token]);

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: (data: { name: string; password: string; confirmPassword: string }) => {
      return newRequest.post(`/workspaces/invite/accept/${token}`, {
        ...data,
        userId: invitationDetails?.userId,
      });
    },
    onSuccess: async (response) => {
      toast.success('Invitation accepted successfully');

      // Extract auth token and user data
      const { token: authToken, user } = response.data.data;

      // Store authentication token
      if (authToken) {
        localStorage.setItem('authToken', authToken);
      }

      // Store user data in cookie if available
      if (user) {
        setCookie('user', JSON.stringify(user));
      } else {
        // If no user data/token provided, try to log in the user
        try {
          await login(invitationDetails?.email || '', password, { noRedirect: true });
        } catch (err) {
          console.error('Auto-login failed:', err);
          // Continue with redirection even if auto-login fails
        }
      }

      // Get the workspace slug for redirection
      const workspaceSlug =
        response.data.data.workspace?.slug ||
        invitationDetails?.workspaceName?.toLowerCase().replace(/\s+/g, '-');

      // Redirect to workspace using subdomain
      const hostname = window.location.hostname;

      // Check if we're on localhost (development)
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // For local development, continue using path-based routing
        router.push(`/${workspaceSlug}`);
      } else {
        // For production, use subdomain-based routing
        // Extract the base domain (e.g., hourblock.com from app.hourblock.com)
        const domainParts = hostname.split('.');
        const baseDomain =
          domainParts.length > 2
            ? domainParts.slice(1).join('.') // For subdomains like app.hourblock.com
            : hostname; // For apex domain

        // Construct the subdomain URL
        const protocol = window.location.protocol;
        const subdomainUrl = `${protocol}//${workspaceSlug}.${baseDomain}`;

        // Navigate to the subdomain
        window.location.href = subdomainUrl;
      }
    },
    onError: (error) => {
      console.error('Failed to accept invitation:', error);
      toast.error('Failed to accept invitation');
    },
  });

  const handleAcceptInvitation = () => {
    // Validate form
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (invitationDetails?.needsPasswordChange) {
      if (password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    // Submit the form
    acceptInvitationMutation.mutate({
      name,
      password,
      confirmPassword,
    });
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-sm text-muted-foreground'>Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error || !invitationDetails) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Invalid Invitation</CardTitle>
            <CardDescription>
              {error || 'This invitation link is invalid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              className='w-full'
              onClick={() => {
                return router.push('/');
              }}
            >
              Return to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center p-4 bg-muted/40'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
            <MailIcon className='h-6 w-6 text-primary' />
          </div>
          <CardTitle className='text-2xl'>You&apos;ve been invited!</CardTitle>
          <CardDescription>
            Join <span className='font-medium'>{invitationDetails.workspaceName}</span> as a{' '}
            <span className='font-medium capitalize'>{invitationDetails.role}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' value={invitationDetails.email} disabled className='bg-muted/50' />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='name'>Your Name</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => {
                return setName(e.target.value);
              }}
              placeholder='Enter your full name'
            />
          </div>

          <Separator className='my-4' />

          {invitationDetails.needsPasswordChange ? (
            <>
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='password'>Set Password</Label>
                  <ShieldCheck className='h-4 w-4 text-muted-foreground' />
                </div>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => {
                    return setPassword(e.target.value);
                  }}
                  placeholder='Create a password'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => {
                    return setConfirmPassword(e.target.value);
                  }}
                  placeholder='Confirm your password'
                />
              </div>
            </>
          ) : null}
        </CardContent>
        <CardFooter className='flex flex-col gap-4'>
          <Button
            className='w-full'
            onClick={handleAcceptInvitation}
            disabled={acceptInvitationMutation.isPending}
          >
            {acceptInvitationMutation.isPending
              ? 'Setting up your account...'
              : 'Accept Invitation'}
          </Button>
          <p className='text-xs text-center text-muted-foreground'>
            By accepting this invitation, you agree to the Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
