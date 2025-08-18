
// const mysql = require('mysql2');

// const { faker } = require('@faker-js/faker');


// // MySQL config — change credentials if needed
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '123456', // 🔒 change this!
  
//   database: 'student_db',
//   multipleStatements: true,
// });

// // Connect to MySQL
// connection.connect(err => {
//   if (err) throw err;
//   console.log('✅ Connected to MySQL');

//   // Create database and table
//   const createDatabaseAndTable = `
//     CREATE DATABASE IF NOT EXISTS student_db;
//     USE student_db;
//     CREATE TABLE IF NOT EXISTS students (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       full_name VARCHAR(100),
//       age INT,
//       gender VARCHAR(20),
//       email VARCHAR(100) UNIQUE,
//       address TEXT,
//       gpa FLOAT,
//       enrollment_year INT
//     );
//   `;

//   connection.query(createDatabaseAndTable, err => {
//     if (err) throw err;
//     console.log('✅ Database and table ready');

//     // Generate and insert 500 fake students
//     const genders = ['Male', 'Female', 'Non-binary', 'Other'];
//     const students = [];

//     const { faker } = require('@faker-js/faker');

// for (let i = 0; i < 500; i++) {
//   const full_name = faker.person.fullName();
//   const age = faker.number.int({ min: 17, max: 25 }); // ✅ correct
//   const gender = genders[Math.floor(Math.random() * genders.length)];
//   const email = faker.internet.email();
//   const address = `${faker.location.streetAddress()}, ${faker.location.city()}`; // ✅ updated from address
//   const gpa = parseFloat((Math.random() * (4.0 - 2.0) + 2.0).toFixed(2));
//   const enrollment_year = faker.number.int({ min: 2018, max: 2025 }); // ✅ correct

//   students.push([full_name, age, gender, email, address, gpa, enrollment_year]);
// }


// console.log(students)

//     const insertQuery = `
//       INSERT INTO students (full_name, age, gender, email, address, gpa, enrollment_year)
//       VALUES ?
//     `;

//     connection.query(insertQuery, [students], (err, result) => {
//       if (err) throw err;
//       console.log(`✅ Inserted ${result.affectedRows} student records`);
//       connection.end();
//     });
//   });
// });
const mysql = require('mysql2');
const { faker } = require('@faker-js/faker');

// MySQL config — change credentials if needed
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456', // 🔒 Change if needed
  database: 'student_db',
  multipleStatements: true
});

// Connect to MySQL
connection.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');

  const createTableQuery = `
    CREATE DATABASE IF NOT EXISTS student_db;
    USE student_db;
    DROP TABLE IF EXISTS students;
    CREATE TABLE students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100),
      age INT,
      gender VARCHAR(20),
      email VARCHAR(100) UNIQUE,
      address TEXT,
      gpa FLOAT,
      enrollment_year INT,
      gist TEXT
    );
  `;

  connection.query(createTableQuery, async (err) => {
    if (err) throw err;
    console.log('✅ Database and table ready');

    const totalRecords = 1_000_000;
    const batchSize = 10_000;
    const totalBatches = totalRecords / batchSize;

    const insertQuery = `INSERT INTO students 
      (full_name, age, gender, email, address, gpa, enrollment_year,gist) 
      VALUES ?`;

    for (let batch = 0; batch < totalBatches; batch++) {
      const studentsBatch = [];

      for (let i = 0; i < batchSize; i++) {
        const uniqueEmail = `user${batch * batchSize + i}@example.com`; // ensures unique email
        studentsBatch.push([
          faker.person.fullName(),
          faker.number.int({ min: 18, max: 30 }),
          faker.helpers.arrayElement(['Male', 'Female']),
          uniqueEmail,
          faker.location.streetAddress(),
          parseFloat((Math.random() * 4).toFixed(2)),
          faker.date.anytime().getFullYear(),
          faker.lorem.sentence(10)
        ]);
      }

      await new Promise((resolve, reject) => {
        connection.query(insertQuery, [studentsBatch], (err, result) => {
          if (err) {
            console.error(`❌ Error in batch ${batch + 1}:`, err);
            reject(err);
          } else {
            console.log(`✅ Batch ${batch + 1}/${totalBatches} inserted (${result.affectedRows} records)`);
            resolve();
          }
        });
      });
    }

    console.log('✅ All 1,000,000 records inserted');
    connection.end();
  });
});
