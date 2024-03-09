const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
require('./database/database'); 
require('./models/populate');

const User = require('./models/user');
const Product = require('./models/product');

const app = express();
app.use(express.json());

app.get('/users', async (req, res) => {
    try {
      const users = await User.find({});
      res.status(200).json(users);
    } catch (error) {
      res.status(500).send({ message: 'Error fetching users', error: error.message });
    }
  });

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

app.get('/products', async (req, res) => {
    try {
      const products = await Product.find({});
      res.status(200).json(products);
    } catch (error) {
      res.status(500).send({ message: 'Error fetching products', error: error.message });
    }
  });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
