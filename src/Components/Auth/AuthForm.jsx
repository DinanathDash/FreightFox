import { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import Logo from '../../assets/Logo.svg';
import BGImage from '../../assets/BG.jpg';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { login, signup, googleSignIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const errors = [];

    // Check minimum length
    if (password.length < 8) {
      errors.push("be at least 8 characters long");
    }

    // Check for uppercase character
    if (!/[A-Z]/.test(password)) {
      errors.push("contain at least one uppercase letter");
    }

    // Check for lowercase character
    if (!/[a-z]/.test(password)) {
      errors.push("contain at least one lowercase letter");
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("contain at least one special character");
    }

    // Check for numeric character
    if (!/[0-9]/.test(password)) {
      errors.push("contain at least one number");
    }

    if (errors.length > 0) {
      return `Password must ${errors.join(", ")}`;
    }

    return null;
  };

  // This function is used only during form submission
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error("Image is too large. Please select an image under 2MB");
      return;
    }

    // Preview the image and store it for later upload
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePicture(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      navigate('/');
    } catch (error) {
      toast.error('Could not sign in with Google. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Collect validation errors only on submit
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await resetPassword(email);
      toast.success('Password reset email sent. Please check your inbox.');
      setIsResetPassword(false);
    } catch (error) {
      toast.error('Could not send reset email. Please check your email address.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isResetPassword) {
      handleResetPassword(e);
      return;
    }

    // Collect validation errors
    const errors = [];

    // Validate email
    if (!email) {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Please include an @ in the email address');
    }

    // Validate password
    if (!password) {
      errors.push('Password is required');
    }

    // Additional validations for registration
    if (!isLogin) {
      // Validate name
      if (!name) {
        errors.push('Name is required');
      }

      // Validate password match
      if (password !== confirmPassword) {
        errors.push('Passwords do not match');
      }

      // Validate password strength
      const passwordError = validatePassword(password);
      if (passwordError) {
        errors.push(passwordError);
      }
    }

    // Show all errors as one toast
    if (errors.length > 0) {
      toast.error(errors[0]); // Show only the first error
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        // Register with email and password
        const userCredential = await signup(email, password, name);

        // If a profile picture was selected, update the user profile
        if (profilePicture && userCredential.user) {
          try {
            await updateProfile(userCredential.user, {
              photoURL: profilePicture
            });
          } catch (photoError) {
            console.error("Error setting profile photo:", photoError);
            // Continue anyway, as the account was already created
          }
        }

        toast.success('Registration successful! Please log in to continue.');
        setIsLogin(true);
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please try logging in instead.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        // Use our more detailed password validation message
        const passwordError = validatePassword(password);
        toast.error(passwordError || 'Password is too weak. It must meet all the requirements.');
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full h-full relative px-4 py-6 sm:py-10 md:py-16"
      style={{
        backgroundImage: `url(${BGImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      {/* Logo positioned at absolute top left corner of window */}
      <div className="fixed top-3 sm:top-4 left-3 sm:left-4 z-10">
        <img src={Logo} alt="FreightFox Logo" className="h-8 sm:h-8 md:h-10 w-auto" />
      </div>

      <div className="w-full max-w-[90%] xs:max-w-[360px] sm:max-w-md relative mx-auto">
        <Card className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-xl w-full">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-center text-lg sm:text-xl font-semibold text-black">
              {isResetPassword ? 'Reset Password' : isLogin ? 'Sign in with email' : 'Register'}
            </CardTitle>
            <CardDescription className="text-center text-gray-700 px-2 sm:px-6 text-sm sm:text-base">
              {isResetPassword
                ? 'Enter your email to reset your password'
                : isLogin
                  ? 'Enter your credentials to access your account'
                  : 'Create a new account to get started'}
            </CardDescription>
          </CardHeader>

          <CardContent className="py-2 sm:py-4">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" noValidate>
              {!isLogin && !isResetPassword && (
                <>
                  <div className="space-y-2">
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="bg-white/70 border border-gray-200 h-9 sm:h-10 text-sm sm:text-base px-2 sm:px-3"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2" >
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="bg-white/70 border border-gray-200 h-9 sm:h-10 text-sm sm:text-base px-2 sm:px-3"
                />
              </div>

              {!isResetPassword && (
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="bg-white/70 border border-gray-200 h-9 sm:h-10 text-sm sm:text-base px-2 sm:px-3"
                  />
                </div>
              )}

              {!isLogin && !isResetPassword && (
                <div className="space-y-2">
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="bg-white/70 border border-gray-200 h-9 sm:h-10 text-sm sm:text-base px-2 sm:px-3"
                  />
                </div>
              )}

              {isLogin && !isResetPassword && (
                <div className="flex justify-end -mt-2 sm:-mt-3">
                  <Button
                    variant="link"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsResetPassword(true);
                    }}
                    className="p-0 text-[10px] sm:text-xs text-gray-700 cursor-pointer h-auto"
                  >
                    Forgot password?
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-black text-white cursor-pointer text-sm sm:text-base py-1.5 sm:py-2"
              >
                {isResetPassword ? 'Send Reset Link' : isLogin ? 'Get Started' : 'Register'}
              </Button>

              {!isResetPassword && (
                <>
                  <div className="relative flex items-center justify-center mt-2 mb-1">
                    <div className="border-t border-gray-400 flex-grow"></div>
                    <span className="mx-2 sm:mx-4 text-xs sm:text-sm text-gray-600">Or sign in with</span>
                    <div className="border-t border-gray-400 flex-grow"></div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2 sm:mt-4 flex justify-center items-center gap-1 sm:gap-2 border border-gray-300 bg-white/80 py-1.5 sm:py-2 cursor-pointer text-xs sm:text-sm"
                    onClick={handleGoogleSignIn}
                  >
                    <svg width="16" height="16" className="sm:w-[20px] sm:h-[20px]" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                      <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" />
                      <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" />
                      <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" />
                      <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" />
                    </svg>
                    <span>Continue with Google</span>
                  </Button>
                </>
              )}
            </form>
          </CardContent>

          <CardFooter className="flex flex-col text-center -mt-6">
            {!isResetPassword && (
              <div className="w-full">
                <div className="text-center">
                  <span
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-xs sm:text-sm text-gray-700 cursor-pointer hover:underline"
                  >
                    {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                  </span>
                </div>
              </div>
            )}
            {isResetPassword && (
              <div className="w-full">
                <div className="text-center">
                  <span
                    onClick={() => setIsResetPassword(false)}
                    className="text-xs sm:text-sm text-gray-700 cursor-pointer hover:underline"
                  >
                    Back to login
                  </span>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
      <Toaster
        position="bottom-center"
        closeButton
        richColors
        theme="light"
        duration={3000}
        className="toast-container"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#374151',
            border: '2px solid #e5e7eb',
            fontSize: '0.875rem',
            maxWidth: '90vw',
          },
          success: {
            style: {
              border: '2px solid #359E45',
            },
          },
          error: {
            style: {
              border: '2px solid #EF4444',
            },
          },
        }}
      />
    </div>
  );
}

export default AuthForm;
