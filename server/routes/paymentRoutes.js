const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // amount in BDT

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe needs smallest unit
      currency: 'usd', // use 'usd' for test mode
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;