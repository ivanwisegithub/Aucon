export const getTokenFromStorage = () => {
  return localStorage.getItem('token') || localStorage.getItem('access_token')
}

export const isUserAuthenticated = () => {
  const token = getTokenFromStorage()
  if (!token) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp > currentTime
  } catch (error) {
    return false
  }
}