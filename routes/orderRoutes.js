import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import Order from '../models/Order.js';

dotenv.config();  // <—— 🟢 Load env vars here

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc   Create new order + handle payment (Stripe fake)
// @route  POST /api/orders
router.post('/', async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    let paymentResult = {};

    if (paymentMethod === 'card') {
      // Simulate Stripe payment in test mode
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100), // amount in cents
        currency: 'usd',
        payment_method_types: ['card'],
        description: 'Test payment for order',
      });

      // Fake payment result
      paymentResult = {
        id: paymentIntent.id,
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: 'testuser@example.com',
      };
    } else {
      // For PayPal / COD — just mark as not paid
      paymentResult = {
        id: 'N/A',
        status: paymentMethod === 'cod' ? 'pending' : 'approved',
        update_time: new Date().toISOString(),
        email_address: 'N/A',
      };
    }

    // Create Order
    const order = new Order({
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      paymentResult,
      isPaid: paymentMethod === 'card', // Mark paid if card
      paidAt: paymentMethod === 'card' ? Date.now() : null,
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Order creation failed' });
  }
});

export default router;
