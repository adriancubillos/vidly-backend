const mongoose = require('mongoose');
const Joi = require('joi');

const customerSchema = new mongoose.Schema({
  name   : {
    type      : String,
    required  : true,
    minlength : 2,
    maxlength : 50
  },
  isGold : { type: Boolean, default: false },
  phone  : {
    type      : String,
    required  : true,
    minlength : 2,
    maxlength : 50
  }
});

const Customer = mongoose.model('Customer', customerSchema);

function validateCustomer(customer) {
  const schema = {
    name   : Joi.string().min(2).required(),
    phone  : Joi.string().required().min(2).max(50),
    isGold : Joi.boolean()
  };

  return Joi.validate(customer, schema);
}

exports.Customer = Customer;
exports.customerSchema = customerSchema;
exports.validate = validateCustomer;
