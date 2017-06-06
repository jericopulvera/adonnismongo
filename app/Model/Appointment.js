'use strict'

const mongoose = use('Mongoose')

const scheduleSchema = mongoose.Schema({
  agent: {
    type: 'ObjectId',
    ref: 'User'
  },
  customer: {
    type: 'ObjectId',
    ref: 'Customer'
  },
  start_time: Date,
  end_time: Date,
  description: String,
  comment: String,
  isStarted: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  started: Number,
  ended: Number,
  invoice_title: String,
  invoice_no: String,
  items: [],
  invoice_description: String,
  invoice_date: Date,
  invoice_settled: {
    type: Boolean
  },
  payment_method: String,
  invoice_comment: String,
  payment_method_desc: mongoose.Schema.Types.Mixed,
  shipping: Number,
  discount: Number,
  tax: Number,
  created: {
    type: Date,
    default: Date.now
  }
})
const Appointment = mongoose.model('Appointment', scheduleSchema)
module.exports = Appointment
