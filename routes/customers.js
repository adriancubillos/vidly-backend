const auth = require('../middleware/auth');
const { Customer, validate } = require('../models/customer');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const customers = await Customer.find().sort({ name: 1 });

  res.status(200).send(customers);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const customer = new Customer({
    name   : req.body.name,
    phone  : req.body.phone,
    isGold : req.body.isGold
  });

  await customer.save();

  res.send(customer);
});

router.put('/:id', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      $set : {
        name   : req.body.name,
        phone  : req.body.phone,
        isGold : req.body.isGold || false
      }
    },
    { new: true } // with this returns the updated doc, without is rettruen the original doc before udate operation
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
