import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { isUserAuthenticated } from '../utils/authHelper'

export const useAuthCheck = () => {
  const { currentUser } = useSelector(state => state.user)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = () => {
      const hasValidToken = isUserAuthenticated()
      const hasUser = currentUser !== null

      if (!hasValidToken || !hasUser) {
        // Redirect to sign-in with return URL
        navigate(`/sign-in?redirect=${encodeURIComponent(location.pathname)}`)
      }
    }

    checkAuth()
  }, [currentUser, navigate, location.pathname])

  return {
    isAuthenticated: currentUser !== null && isUserAuthenticated(),
    currentUser
  }
}