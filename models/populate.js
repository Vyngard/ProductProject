// Dynamic import of node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const bcrypt = require('bcryptjs');

const Product = require('./product');
const User = require('./user');
const Cart = require('./cart');

const users = [
  { name: 'Alice', email: 'alice@example.com', password: 'password' },
  { name: 'Bob', email: 'bob@example.com', password: 'password' },
  { name: 'Charlie', email: 'charlie@example.com', password: 'password' },
  { name: 'David', email: 'david@example.com', password: 'password' },
  { name: 'Eve', email: 'eve@example.com', password: 'password',},
  { name: 'Frank', email: 'frank@example.com', password: 'password' },
  { name: 'Grace', email: 'grace@example.com', password: 'password' },
  { name: 'Hannah', email: 'hannah@example.com', password: 'password' },
  { name: 'Ivan', email: 'ivan@example.com', password: 'password' },
  { name: 'Judy', email: 'judy@example.com', password: 'password' },
];

const products = [
  {
    title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
    price: 109.95,
    category: 'bags',
    inventoryCount: 100,
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
  },
  {
    title: 'Mens Casual Premium Slim Fit T-Shirts ',
    price: 22.3,
    category: 'clothing',
    inventoryCount: 100,
    image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
  },
  {
    title: 'Mens Cotton Jacket',
    price: 55.99,
    category: 'clothing',
    inventoryCount: 100,
    image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
  },
  {
    title: 'Mens Casual Slim Fit',
    price: 15.99,
    category: 'clothing',
    inventoryCount: 100,
    image: 'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg',
  },
  {
    title: 'John Hardy Women\'s Legends Naga Gold & Silver Dragon Station Chain Bracelet',
    price: 695,
    category: 'jewelery',
    inventoryCount: 100,
    image: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg',
  },
  {
    title: 'Solid Gold Petite Micropave ',
    price: 168,
    category: 'jewelery',
    inventoryCount: 100,
    image: 'https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg',
  }
];


async function populateCarts() {
  try {
    const sampleUsers = await User.find().limit(2);
    const sampleProducts = await Product.find().limit(2);

    for (let i = 0; i < sampleUsers.length; i++) {
      const user = sampleUsers[i];
      const items = sampleProducts.map(product => ({
        product: product._id,
        quantity: Math.floor(Math.random() * 5) + 1
      }));

      const cart = new Cart({ user: user._id, items });
      await cart.save();
    }

    console.log('Sample carts inserted successfully!');
  } catch (error) {
    console.error('Error populating carts:', error);
  }
}


async function populateSampleProducts() {
  try {
    await Product.deleteMany({});
    console.log('Existing products deleted successfully!');

    await Product.insertMany(products);
    console.log('New products inserted successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

async function populateUsers() {
  try {
    await User.deleteMany({});
    console.log('Existing users deleted successfully!');

    for (let userData of users) {
      const user = new User({ ...userData});
      await user.save();
    }
    console.log('Sample users inserted successfully!');
  } catch (error) {
    console.error('Error populating users:', error);
  }
}

async function main() {
  await populateSampleProducts();
  await populateUsers();
  await populateCarts();
}

main().catch(console.error);
