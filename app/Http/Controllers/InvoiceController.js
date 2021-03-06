'use strict'

var ApiContracts = require('authorizenet').APIContracts
var ApiControllers = require('authorizenet').APIControllers

// end authorize
const moment = require('moment')
const path = require('path')
const Helpers = use('Helpers')
const publicPath = Helpers.publicPath()
const Appointment = use('App/Model/Appointment')
const Discountcode = use('App/Model/Discountcode')
const Mail = use('Mail')
use('App/Model/User')
use('App/Model/Customer')
// ups api
// var upsAPI = require('shipping-ups')
// var ups = new upsAPI({
//   environment: 'sandbox', // or live
//   username: 'UPSUSERNAME',
//   password: 'UPSPASSWORD',
//   access_key: 'UPSACCESSTOKEN',
//   imperial: true // set to false for metric
// })

class InvoiceController {

  * index (req, res) {
    const invoices = yield Appointment.find({ invoice_settled: false }).populate('agent', 'name email').populate('customer', 'name email phone address1 address2 city state zipCode').exec()
    res.ok(invoices)
  }

  * show (req, res) {
    const id = req.param('id')
    const invoice = yield Appointment.findOne({ _id: id }).populate('agent', 'name email').populate('customer', 'name email phone address1 address2 city state zipCode').exec()
    res.ok(invoice)
  }
  * discountCodeInfo (req, res) {
    const discountCode = req.input('discount_code')
    const discountInfo = yield Discountcode.findOne({ discount_code: discountCode }).exec()
    res.ok(discountInfo)
  }

  * getByAgent (req, res) {
    var lastYear = moment().subtract(1, 'year').toDate()
    var today = moment().toDate()
    let userId = req.param('id')
    if (userId === 'me') {
      userId = req.currentUser._id
    }
    const invoices = yield Appointment.find({invoice_settled: true, agent: userId, invoice_date: {$gte: lastYear, $lt: today}}).exec()
    var weeks = []
    var year = {}
    year.item = {}
    year.totalPrice = 0
    if (invoices.length) {
      invoices.forEach(function (invoiceVal, key) {
        if (invoiceVal.items.length) {
          invoiceVal.items.forEach(function (supplyVal, newKey) {
            let price = supplyVal.price * supplyVal.quantity * supplyVal.commission / 100
            year.totalPrice += price
            if (!year.item[supplyVal.description]) {
              year.item[supplyVal.description] = 0
            }
            year.item[supplyVal.description] += price
          })
        }
      })
    }
    for (var i = 0; i < 4; i++) {
      var weekData = {}
      weekData.item = {}
      var date = moment().subtract(i, 'week').startOf('week').toDate()
      var datePrevious = moment().subtract(i + 1, 'week').startOf('week').toDate()
      weekData.date = moment(date).format('MMMM Do YYYY')
      weekData.totalPrice = 0
      if (invoices.length) {
        invoices.forEach(function (invoiceVal, key) {
          if (datePrevious <= invoiceVal.invoice_date && invoiceVal.invoice_date < date) {
          // if (datePrevious) {
            if (invoiceVal.items.length) {
              invoiceVal.items.forEach(function (supplyVal, newKey) {
                let price = supplyVal.price * supplyVal.quantity * supplyVal.commission / 100
                weekData.totalPrice += price
                if (!weekData.item[supplyVal.description]) {
                  weekData.item[supplyVal.description] = 0
                }
                weekData.item[supplyVal.description] += price
              })
            }
          }
        })
      }
      weeks.push(weekData)
    }
    res.send({year: year, weeks: weeks})
  }
  * getAllAgent (req, res) {
    let flag = req.param('id')
    // let flag = req.all()
    const invoices = yield Appointment.find({invoice_settled: true}).populate('agent').exec()
    var weeks = []
    var weekData = {}
    var date = moment().subtract(flag, 'week').startOf('week').toDate()
    let dateFormat = moment(date).format('MMMM Do YYYY')
    var datePrevious = moment().subtract(flag + 1, 'week').startOf('week').toDate()

    if (invoices.length) {
      invoices.forEach(function (invoiceVal, key) {
        if (datePrevious <= invoiceVal.invoice_date && invoiceVal.invoice_date < date) {
          weekData.invoiceId = invoiceVal._id
          weekData.agentName = invoiceVal.agent.name
          weekData.totalPrice = 0
          weekData.totalCommissionPrice = 0
          // if (datePrevious) {
          if (invoiceVal.items.length) {
            invoiceVal.items.forEach(function (supplyVal, newKey) {
              let commissionPrice = supplyVal.price * supplyVal.quantity * supplyVal.commission / 100
              let price = supplyVal.price * supplyVal.quantity
              weekData.totalCommissionPrice += commissionPrice
              weekData.totalPrice += price
            })
          }
          weeks.push(weekData)
          weekData = {}
        }
      })
    }
    res.send({weeks: weeks, date: dateFormat, flag: flag})
  }

  * addItem (req, res) {
    const items = req.input('items')
    const id = req.input('id')
    yield Appointment.update({ _id: id }, { items }).exec()
  }

  * getInvoices (req, res) {
    const cursor = yield new Promise((resolve, reject) => {
      let data = []
      Appointment.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.description',
            total: { $sum: '$items.price' },
            quan: { $sum: '$items.quantity' },
            com: { $first: '$items.commission' }
          }
        }])
        .cursor({ batchSize: 1000 })
        .exec()
        .on('data', doc => data.push(doc))
        .on('end', () => resolve(data))
    })

    res.ok(cursor)
  }

  * newFunc (res, invoiceInfo, paymentDescription, paymentTypeApp, discount, shippingAmount, tax) {
    console.log(invoiceInfo)
    var errorInfo = 'no'
    var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType()
    merchantAuthenticationType.setName('3x2uZZ6s') // clients real info for production
    merchantAuthenticationType.setTransactionKey('8A225r6g7RW3JrXD')
    // merchantAuthenticationType.setName('2Hj65WGkT') // sandbox info
    // merchantAuthenticationType.setTransactionKey('5V8t4sR7Bq3yP39z')

    var creditCard = new ApiContracts.CreditCardType()
    // creditCard.setCardNumber('4012888818888')
    // creditCard.setExpirationDate('0822')
    // creditCard.setCardCode('999')
    creditCard.setCardNumber(paymentDescription.card_no)
    creditCard.setExpirationDate(paymentDescription.exp_date)
    creditCard.setCardCode(paymentDescription.card_code)

    var paymentType = new ApiContracts.PaymentType()
    paymentType.setCreditCard(creditCard)

    var orderDetails = new ApiContracts.OrderType()
    orderDetails.setInvoiceNumber(invoiceInfo._id)
    orderDetails.setInvoiceNumber('12')
    orderDetails.setDescription(invoiceInfo.description)
    var shipping = new ApiContracts.ExtendedAmountType()
    shipping.setAmount('1')
    shipping.setName('shipping name')
    shipping.setDescription(invoiceInfo.description)

    var billTo = new ApiContracts.CustomerAddressType()
    billTo.setFirstName(paymentDescription.bill_first_name)
    billTo.setLastName(paymentDescription.bill_last_name)
    billTo.setCompany(paymentDescription.bill_company)
    billTo.setAddress(paymentDescription.bill_address)
    billTo.setCity(paymentDescription.bill_city)
    billTo.setState(paymentDescription.bill_state)
    billTo.setZip(paymentDescription.bill_zip)
    billTo.setCountry(paymentDescription.bill_country)

    var shipTo = new ApiContracts.CustomerAddressType()
    shipTo.setFirstName(paymentDescription.ship_first_name)
    shipTo.setLastName(paymentDescription.ship_last_name)
    shipTo.setCompany(paymentDescription.ship_company)
    shipTo.setAddress(paymentDescription.ship_address)
    shipTo.setCity(paymentDescription.ship_city)
    shipTo.setState(paymentDescription.ship_state)
    shipTo.setZip(paymentDescription.ship_zip)
    shipTo.setCountry(paymentDescription.ship_ountry)

    var transactionRequestType = new ApiContracts.TransactionRequestType()
    transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHONLYTRANSACTION)
    transactionRequestType.setPayment(paymentType)
    transactionRequestType.setAmount(paymentDescription.grandTotal)
    transactionRequestType.setOrder(orderDetails)
    // transactionRequestType.setShipping(shipping)
    transactionRequestType.setBillTo(billTo)
    transactionRequestType.setShipTo(shipTo)
    var createRequest = new ApiContracts.CreateTransactionRequest()
    createRequest.setMerchantAuthentication(merchantAuthenticationType)
    createRequest.setTransactionRequest(transactionRequestType)
    var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON())
    // ctrl.setEnvironment('https://apitest.authorize.net/xml/v1/request.api') // sandbox
    ctrl.setEnvironment('https://api.authorize.net/xml/v1/request.api') // production
    ctrl.execute(function () {
      var apiResponse = ctrl.getResponse()
      var response = new ApiContracts.CreateTransactionResponse(apiResponse)
      if (response != null) {
        if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
          if (response.getTransactionResponse().getMessages() != null) {
            Appointment.update({ _id: invoiceInfo._id }, { $set: { invoice_settled: true, payment_method: paymentTypeApp, payment_method_desc: paymentDescription, invoice_date: new Date(), invoice_comment: invoiceInfo.invoice_comment, discount: discount, shipping: shippingAmount, tax: tax } }).exec()
            let updatedInvoice = Appointment.findOne({ _id: invoiceInfo._id }).exec()
            res.send({invoiceinfo: updatedInvoice, error: errorInfo})
          } else {
            if (response.getTransactionResponse().getErrors() != null) {
              errorInfo = response.getTransactionResponse().getErrors().getError()[0].getErrorText()
              res.send({invoiceinfo: invoiceInfo, error: errorInfo})
            }
          }
        } else {
          if (response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null) {
            errorInfo = response.getTransactionResponse().getErrors().getError()[0].getErrorText()
            res.send({invoiceinfo: invoiceInfo, error: errorInfo})
          } else {
            errorInfo = response.getMessages().getMessage()[0].getText()
            res.send({invoiceinfo: invoiceInfo, error: errorInfo})
          }
        }
      } else {
        console.log('Null Response.')
      }
    })
  }
  * payment (req, res) {
    const paymentTypeApp = req.input('paymentType')
    const discount = req.input('discount')
    const shipping = req.input('shipping')
    const tax = req.input('tax')
    const invoiceInfo = req.input('invoice')
    let invoiceComment = ''
    if (paymentTypeApp !== 'check') {
      invoiceComment = invoiceInfo.invoice_comment
    }
    const id = req.input('id')
    var errorInfo = 'no'
    let paymentDescription = {}
    if (paymentTypeApp === 'check') { // for check
      let storagePath = 'check_doc'
      const backFile = req.file('back_file', {
        maxSize: '2mb',
        allowedExtensions: ['jpg', 'png', 'jpeg']
      })
      const fileName = `${id}_back.${backFile.extension()}`
      yield backFile.move(Helpers.publicPath(storagePath), fileName)
      const frontFile = req.file('front_file', {
        maxSize: '2mb',
        allowedExtensions: ['jpg', 'png', 'jpeg']
      })
      const frontFileName = `${id}_front.${frontFile.extension()}`
      yield frontFile.move(Helpers.publicPath(storagePath), frontFileName)
      paymentDescription = {amount: req.input('amount'), check_no: req.input('check_no'), account_no: req.input('account_no'), routing_no: req.input('routing_no'), back_file: backFile.uploadName(), front_file: frontFile.uploadName()}
      invoiceComment = req.input('invoiceComment')
    } else if (paymentTypeApp === 'card') { // for card
      return yield this.newFunc(res, invoiceInfo, req.input('paymentDescription'), paymentTypeApp, discount, shipping, tax)
    } else { // for cash
      paymentDescription = req.input('paymentDescription')
    }
    if (errorInfo === 'no') {
      // let invoiceSettled = new Date()
      let invoiceSettled = moment().subtract(1, 'week').startOf('week').toDate()
      yield Appointment.update({ _id: id }, { $set: { invoice_settled: true, payment_method: paymentTypeApp, payment_method_desc: paymentDescription, invoice_date: invoiceSettled, invoice_comment: invoiceComment, discount: discount, shipping: shipping, tax: tax } }).exec()
      let updatedInvoice = yield Appointment.findOne({ _id: id }).exec()
      if (paymentTypeApp === 'check') {
        yield Mail.raw('', message => {
          // message.to('sohag2847@gmail.com', 'sohag2847@gmail.com')
          message.to('roland@phostorian.com', 'roland@phostorian.com')
          message.subject('Your check payment info')
          message.attach(path.join(publicPath, `/check_doc/${updatedInvoice.payment_method_desc.front_file}`))
          message.attach(path.join(publicPath, `/check_doc/${updatedInvoice.payment_method_desc.back_file}`))
          message.html(`Hello<br> <p>Your check payment info<br/>
        <br/>Amount:${req.input('amount')}<br/>Check no:${req.input('check_no')}<br/>Account no:${req.input('account_no')}
        <br/>Routing no:${req.input('routing_no')} </p>`)
        })
      }
      res.send({invoiceinfo: updatedInvoice, error: errorInfo})
    } else {
      res.send({invoiceinfo: invoiceInfo, error: errorInfo})
    }
  }

}

module.exports = InvoiceController
