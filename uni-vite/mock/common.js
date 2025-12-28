export const basicTemplate = {
  code: 200,
  success: true,
  message: '请求成功',
  data: null
}

const mockTemplate = {
  'data|5-10': [{
    'id|+1': 10001,
    'name': '@cname',
    'age|18-60': 1,
    'email': '@email',
    'city': '@city',
    'avatar': "@image('100x100', '#4A7BF7', 'Avatar')",
    'birthday': '@date("yyyy-MM-dd")',
    'isActive': '@boolean',
    'score|1-100': 1
  }]
}

const helloWord = () => {
  return {
    'data': '李兆'
  }
}

export default {
  'api/hello/helloWord': helloWord
}