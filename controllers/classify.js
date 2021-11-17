
const _ = require('lodash')
const ft = require('../models/fields_table')
const { ClassifyProxy, ProjectProxy, UserGroupProxy } = require('../proxy')
const config = require('config')
const defPageSize = config.get('pageSize')

async function checkByProjectId (projectId, uid) {
  const project = await ProjectProxy.findOne({ _id: projectId })

  if (project) {
    const group = project.group
    if (group) {
      const userGroup = await UserGroupProxy.findOne({ user: uid, group: group })
      if (!userGroup) return '无权限操作'
    } else if (project.user.id !== uid) {
      /* istanbul ignore else */
      if (!_.find(project.members, ['id', uid])) return '无权限操作'
    }
    return project
  }

  return '项目不存在'
}

module.exports = class ClassifyControllers {
  /**
   * 新增分类
   */
  static async create (ctx) {
    const name = ctx.checkBody('name').notEmpty().value
    console.log('新增分类')
    const uid = ctx.state.user.id
    const projectId = ctx.checkBody('project_id').notEmpty().value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const project = await checkByProjectId(projectId, uid)
    if (typeof project === 'string') {
      ctx.body = ctx.util.refail(project)
      return
    }

    // 是否创建过
    const api = await ClassifyProxy.findOne({
      project: projectId,
      name
    })

    if (api) {
      ctx.body = ctx.util.refail('请检查分类是否已经存在')
      return
    }

    await ClassifyProxy.newAndSave({
      project: projectId,
      name
    })

    ctx.body = ctx.util.resuccess()
  }

  /**
    * 查询列表
    */

  static async list (ctx) {
    const projectId = ctx.checkQuery('project_id').notEmpty().value
    const pageSize = ctx.checkQuery('page_size').empty().toInt().gt(0).default(defPageSize).value
    const pageIndex = ctx.checkQuery('page_index').empty().toInt().gt(0).default(1).value

    const where = { project: projectId }

    // if (classify) {
    //   where.$or = [{
    //     mode: keyExp
    //   }]
    // }

    const opt = {
      skip: (pageIndex - 1) * pageSize,
      limit: pageSize,
      sort: '-create_at'
    }
    let classifies = await ClassifyProxy.find(where, opt)
    classifies = classifies.map(o => _.pick(o, ft.classify))

    ctx.body = ctx.util.resuccess({ classifies: classifies || {} })
  }

  static async update (ctx) {
    const id = ctx.checkBody('id').notEmpty().value
    const name = ctx.checkBody('name').notEmpty().value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    const api = await ClassifyProxy.getById(id)
    if (api) {
      api.name = name
    }

    await ClassifyProxy.updateById(api)
    ctx.body = ctx.util.resuccess()
  }

  static async delete (ctx) {
    const id = ctx.checkBody('id').notEmpty().value

    if (ctx.errors) {
      ctx.body = ctx.util.refail(null, 10001, ctx.errors)
      return
    }

    await ClassifyProxy.delByIds(id)
    ctx.body = ctx.util.resuccess()
  }
}
