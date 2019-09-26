import axios from '@/libs/api.request'
export const login = ({
  userName,
  password
}) => {
  const _data = {
    username: userName,
    password: password
  }

  return axios.request({
    url: 'Login/log',
    headers: {
      "Content-Type": "application/json", //设置请求头请求格式为JSON
    },
    data: _data,
    method: 'post'
  })
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
