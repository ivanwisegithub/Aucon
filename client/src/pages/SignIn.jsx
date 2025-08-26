import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure('Please fill in all required fields'));
    }
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
      } else {
        dispatch(signInSuccess(data));
        navigate('/');
      }
    } catch (error) {
      dispatch(signInFailure('Login failed. Please try again.'));
    }
  };

  return (
    <div className='min-h-screen mt-20 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white'>
      <div className='flex p-6 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-10'>
        
        {/* Intro Left Column */}
        <div className='flex-1'>
          <Link to='/' className='font-bold text-4xl dark:text-white'>
            <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
              Comrades'
            </span>{' '}
            Feedback Hub
          </Link>
          <p className='text-sm mt-5 text-gray-500 dark:text-gray-300'>
            Welcome to the Secure Feedback Portal. Sign in to submit welfare concerns,
            track resolutions, and support your university community.
          </p>
        </div>

        {/* Sign-In Form Right Column */}
        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label value='Email Address' />
              <TextInput
                type='email'
                placeholder='you@university.ac.zw'
                id='email'
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label value='Password' />
              <TextInput
                type='password'
                placeholder='********'
                id='password'
                onChange={handleChange}
                required
              />
            </div>
            <Button
              gradientDuoTone='purpleToPink'
              type='submit'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Signing In...</span>
                </>
              ) : (
                'Access Portal'
              )}
            </Button>
            <OAuth />
          </form>

          <div className='flex gap-2 text-sm mt-5'>
            <span>Don't have an account?</span>
            <Link to='/sign-up' className='text-blue-500 hover:underline'>
              Create one
            </Link>
          </div>

          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
