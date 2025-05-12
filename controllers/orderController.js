import dotenv from 'dotenv';
dotenv.config();

import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import Order from '../models/Order.js';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error('STRIPE_SECRET_KEY not set in .env');
}

const stripe = new Stripe(stripeSecret);



// @desc    Create new order + handle payment (Stripe fake)
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
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
    res.status(400);
    throw new Error('No order items');
  }

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

  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    paymentResult,
    isPaid: paymentMethod === 'card',
    paidAt: paymentMethod === 'card' ? Date.now() : null,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get logged in user's orders (Order History)
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const payOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email');
  res.json(orders);
});

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Update status-related fields
  order.status = status; // Optional explicit status field if your model supports it

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  } else if (status === 'cancelled') {
    order.isCancelled = true;
  }

  // Optional: mark as paid if moving out of processing
  if (status !== 'processing') {
    order.isPaid = true;
    order.paidAt = order.paidAt || Date.now();
    order.paymentResult = {
      ...order.paymentResult,
      status: status === 'processing' ? 'pending' : 'completed',
    };
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});
