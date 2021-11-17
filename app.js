'use strict'

const Koa = require('koa')
const path = require('path')
const config = require('config')
const koaJwt = require('koa-jwt')
const cors = require('@koa/cors')
const koaBody = require('koa-body')
const onerror = require('koa-onerror')
const favicon = require('koa-favicon')
const validate = require('koa-validate')
const pathToRegexp = require('path-to-regexp')
const staticCache = require('koa-static-cache')

const util = require('./util')
const logger = require('./util/logger')
const middleware = require('./middlewares')
const routerConfig = require('./router-config')

const app = module.exports = new Koa()
const uploadConf = config.get('upload')
const jwtSecret = config.get('jwt.secret')

util.init()
onerror(app)
validate(app)

app
  .use(middleware.ipFilter) // Ip过滤方法
  .use(favicon(path.join(__dirname, '/public/images/icon.png'))) // 浏览器标签图标
  .use(serve('/dist', './dist')) // 缓存资源包
  .use(serve('/public', './public')) // 缓存静态资源
  .use(serve('/upload', path.resolve(__dirname, 'config', uploadConf.dir))) // 缓存上传文件
  .use(logger) // 日志中间件
  .use(middleware.util) // 注册攻击类方法
  .use(cors({ credentials: true, maxAge: 2592000 })) // 处理跨域资源共享
  .use(koaJwt({ secret: jwtSecret }).unless((ctx) => { // token认证，unless未可以不需要带token的接口
    if (/^\/api/.test(ctx.path)) {
      return pathToRegexp([
        '/api/u/login',
        '/api/u/register',
        '/api/mock/by_projects',
        '/api/mock/export',
        '/api/wallpaper'
      ]).test(ctx.path)
    }
    return true
  }))
  .use(koaBody({ multipart: true })) // 更高级的请求解析器，支持multipart，urlencoded和json请求体
  .use(routerConfig.mock.routes())
  .use(routerConfig.mock.allowedMethods()) // 对特殊情况 丰富返回头信息
  .use(routerConfig.api.routes())
  .use(routerConfig.api.allowedMethods())

app.proxy = config.get('proxy') // 是否开启代理

/* istanbul ignore if */
if (!module.parent) {
  const port = config.get('port')
  const host = config.get('host')
  app.use(require('./middlewares/view').render(app))
  app.listen(port, host)
  console.log(`server started at http://${host}:${port}`)
}

// 静态资源缓存
function serve (prefix, filePath) {
  return staticCache(path.resolve(__dirname, filePath), {
    prefix: prefix,
    gzip: true,
    dynamic: true,
    maxAge: 60 * 60 * 24 * 30
  })
}
