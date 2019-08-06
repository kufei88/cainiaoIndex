import axios from '@/libs/api.request'

export const login = ({
  userName,
  password
}) => {
  const data = {
    username: userName,
    password: password
  }

  return axios.request({
    url: 'user/login',
    params: data,
    method: 'get'
  })
<<<<<<< HEAD

=======
>>>>>>> 07ca980a457ca035edd06c0ac871d22c1ff4677d
}

export const getUserInfo = (token) => {
  return axios.request({
    url: 'get_info',
    params: {
      token
    },
    method: 'get'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'logout',
    method: 'post'
  })
}
