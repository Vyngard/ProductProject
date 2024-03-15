const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
require('./database/database');
require('./models/populate');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const app = express();
app.use(express.json());

// get all the users
app.get('/users', async (req, res) => {
    try {
      const users = await User.find({});
      res.status(200).json(users);
    } catch (error) {
      res.status(500).send({ message: 'Error fetching users', error: error.message });
    }
  });

// get a user by id
app.get('/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching user', error: error.toString() });
    }
});


// register a user
app.post('/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const user = new User({ name, email, password });
      await user.save();
      res.status(201).send({ user });
    } catch (error) {
      res.status(400).send(error);
    }
  });

// login a user
app.post('/login', async (req, res) => {
try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
    return res.status(404).send({ error: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
    return res.status(400).send({ error: 'Invalid login credentials' });
    }
    res.send({ user });
} catch (error) {
    res.status(500).send();
}
});

// get all the products
app.get('/products', async (req, res) => {
    try {
      const products = await Product.find({});
      res.status(200).json(products);
    } catch (error) {
      res.status(500).send({ message: 'Error fetching products', error: error.message });
    }
  });

// get a product by id
app.get('/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching product', error: error.message });
    }
});

// add a product to cart
app.post('/cart/add', async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ user: userId });
        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
        } else {
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity }]
            });
        }
        await cart.save();
        res.status(200).send(cart);
    } catch (error) {
        res.status(500).send({ message: 'Error updating cart', error: error.message });
    }
});

// remove a product from cart
app.post('/cart/remove', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        let cart = await Cart.findOne({ user: userId });
        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                if (cart.items[itemIndex].quantity > 1) {
                    cart.items[itemIndex].quantity--;
                } else {
                    cart.items.splice(itemIndex, 1);
                }
                await cart.save();
            }
        }
        res.status(200).send(cart);
    } catch (error) {
        res.status(500).send({ message: 'Error removing item from cart', error: error.message });
    }
});

// show all the products in the cart
app.get('/cart/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }
        res.status(200).send(cart);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching cart', error: error.message });
    }
});

// submit the cart
app.post('/cart/:userId/submit', async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }

        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { inventoryCount: -item.quantity }
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).send({ message: 'Order submitted successfully, cart is now empty.' });
    } catch (error) {
        res.status(500).send({ message: 'Error submitting cart', error: error.message });
    }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
