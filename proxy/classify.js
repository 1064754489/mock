'use strict'

const { Classify } = require('../models')

module.exports = class ClassifyProxy {
  static newAndSave (classify) {
    return Classify.insertMany(classify)
  }

  static findOne (query, opt) {
    return Classify.findOne(query, {}, opt).populate('project')
  }

  static find (query, opt) {
    return Classify.find(query, {}, opt).populate('project')
  }

  static getById (classifyId) {
    return Classify.findById(classifyId)
  }

  static updateById (classify) {
    return Classify.update({
      _id: classify.id
    }, {
      $set: {
        name: classify.name
      }
    })
  }

  static delByIds (id) {
    return Classify.remove({
      _id: {
        $in: id
      }
    })
  }
}
