const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Customer = require('./models/Customer');
const ContactMech = require('./models/ContactMech');
const Product = require('./models/Product');

// Connect to MongoDB
connectDB();

// Sample data
const customers = [
  {
    first_name: 'John',
    last_name: 'Doe'
  },
  {
    first_name: 'Jane',
    last_name: 'Smith'
  }
];

const products = [
  {
    product_name: 'T-Shirt',
    color: 'Red',
    size: 'M'
  },
  {
    product_name: 'Jeans',
    color: 'Blue',
    size: '32'
  },
  {
    product_name: 'Sneakers',
    color: 'White',
    size: '9'
  },
  {
    product_name: 'Jacket',
    color: 'Black',
    size: 'L'
  },
  {
    product_name: 'Hat',
    color: 'Green',
    size: 'One Size'
  }
];

// Seed function
const seedData = async () => {
  try {
    // Clear existing data
    await Customer.deleteMany();
    await ContactMech.deleteMany();
    await Product.deleteMany();

    console.log('Data cleared...');

    // Insert customers
    const johnDoe = await Customer.create(customers[0]);
    const janeSmith = await Customer.create(customers[1]);

    console.log('Customers created...');

    // Insert contact mechanisms
    // For John Doe
    const johnContact1 = await ContactMech.create({
      customer: johnDoe._id,
      street_address: '1600 Amphitheatre Parkway',
      city: 'Mountain View',
      state: 'CA',
      postal_code: '94043',
      phone_number: '(650) 253-0000',
      email: 'john.doe@example.com'
    });

    const johnContact2 = await ContactMech.create({
      customer: johnDoe._id,
      street_address: '1 Infinite Loop',
      city: 'Cupertino',
      state: 'CA',
      postal_code: '95014',
      phone_number: '(408) 996-1010',
      email: 'john.doe@work.com'
    });

    // For Jane Smith
    const janeContact = await ContactMech.create({
      customer: janeSmith._id,
      street_address: '350 Fifth Avenue',
      city: 'New York',
      state: 'NY',
      postal_code: '10118',
      phone_number: '(212) 736-3100',
      email: 'jane.smith@example.com'
    });

    console.log('Contact mechanisms created...');

    // Insert products
    await Product.insertMany(products);

    console.log('Products created...');
    console.log('Sample data:');
    console.log(`Customer 1 ID: ${johnDoe._id}`);
    console.log(`Customer 2 ID: ${janeSmith._id}`);
    console.log(`John Contact 1 ID: ${johnContact1._id}`);
    console.log(`John Contact 2 ID: ${johnContact2._id}`);
    console.log(`Jane Contact ID: ${janeContact._id}`);
    
    const createdProducts = await Product.find();
    createdProducts.forEach((product, index) => {
      console.log(`Product ${index + 1} ID: ${product._id} (${product.product_name})`);
    });

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seed function
seedData();