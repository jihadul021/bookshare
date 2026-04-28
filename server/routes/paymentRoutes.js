const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const { amount, successUrl, cancelUrl } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'A valid amount is required' });
    }

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ message: 'Success and cancel URLs are required' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BookShare Order Payment'
            },
            unit_amount: Math.round(amount * 100)
          },
          quantity: 1
        }
      ],
      success_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl}${cancelUrl.includes('?') ? '&' : '?'}payment=cancelled`
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/checkout-session/:sessionId', authMiddleware, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ['payment_intent']
    });

    res.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      status: session.status,
      paymentIntentId: typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
