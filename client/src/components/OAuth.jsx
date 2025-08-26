import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess, signInFailure } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
    const auth = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const handleGoogleClick = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        try {
            const resultsFromGoogle = await signInWithPopup(auth, provider);
            
            // ✅ AUTHENTICATION FIX: Added credentials: 'include'
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: resultsFromGoogle.user.displayName,
                    email: resultsFromGoogle.user.email,
                    googlePhotoUrl: resultsFromGoogle.user.photoURL,
                }),
                credentials: 'include', // CRUCIAL: Enables cookies to be sent/received
            });
            
            const data = await res.json();
            
            // ✅ Enhanced error handling
            if (!res.ok || data.success === false) {
                console.error('❌ Google authentication failed:', data.message);
                dispatch(signInFailure(data.message || 'Google authentication failed'));
                return;
            }
            
            // ✅ Success handling
            console.log('✅ Google authentication successful:', data);
            dispatch(signInSuccess(data.user || data));
            navigate('/');
            
        } catch (error) {
            console.error('❌ Google authentication error:', error);
            dispatch(signInFailure('Google authentication failed. Please try again.'));
        }
    };
    
    return (
        <Button 
            type='button' 
            gradientDuoTone='pinkToOrange' 
            outline 
            onClick={handleGoogleClick}
        >
            <AiFillGoogleCircle className='w-6 h-6 mr-2'/>
            Continue with Google
        </Button>
    );
}