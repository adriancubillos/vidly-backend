const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { Customer, validateCustomer } = require('../models/customer');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const customers = await Customer.find().sort({ name: 1 });
  res.status(200).send(customers);
});

router.post('/', [ auth, validate(validateCustomer) ], async (req, res) => {
  const customer = new Customer({
    name   : req.body.name,
    phone  : req.body.phone,
    isGold : req.body.isGold
  });
  await customer.save();
  res.send(customer);
});

router.put('/:id', [ auth, validate(validateCustomer) ], async (req, res) => {
  let customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      $set : {
        name   : req.body.name,
        phone  : req.body.phone,
        isGold : req.body.isGold || false
      }
    },
    { new: true } // with this, it returns the updated doc, without, it returns the original doc before update operation
  );

  if (!customer) return res.status(404).send(`The customer with the given ID: ${req.params.id} was not found!`);
  res.send(customer);
});

router.delete('/:id', auth, async (req, res) => {
  let customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) return res.status(404).send(`The customer with the given ID: ${req.params.id} was not found!`);
  res.send(customer);
});

router.get('/:id', async (req, res) => {
  let customer = await Customer.findById(req.params.id).sort({ name: 1 });
  if (!customer) return res.status(404).send(`The customer with the given ID: ${req.params.id} was not found!`);
  res.send(customer);
});

module.exports = router;
