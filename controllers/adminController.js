import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'processing' });

    const totalProducts = await Product.countDocuments();

    res.json({
      totalSales: totalSales[0]?.total || 0,
      totalOrders,
      pendingOrders,
      totalProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
};
