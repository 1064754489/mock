'use strict'

// const { string } = require('jszip/lib/support')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  name: String,
  description: String,
  mode: String,
  url: String,
  method: String,
  parameters: String,
  response_model: String,
  create_at: {
    type: Date,
    default: Date.now
  },
  classify: String
})

schema.index({ project: 1, create_at: -1 })

module.exports = mongoose.model('Mock', schema)
