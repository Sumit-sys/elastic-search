
// const mysql = require('mysql2');
// const { faker } = require('@faker-js/faker');

// // MySQL config — change credentials if needed
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '123456', // 🔒 Change if needed
//   database: 'student_db',
//   multipleStatements: true
// });

// // Connect to MySQL
// connection.connect((err) => {
//   if (err) throw err;
//   console.log('✅ Connected to MySQL');

//   const createTableQuery = `
//     CREATE DATABASE IF NOT EXISTS student_db;
//     USE student_db;
//     DROP TABLE IF EXISTS students;
//     CREATE TABLE students (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       full_name VARCHAR(100),
//       age INT,
//       gender VARCHAR(20),
//       email VARCHAR(100) UNIQUE,
//       address TEXT,
//       gpa FLOAT,
//       enrollment_year INT,
//       gist TEXT
//     );
//   `;

//   connection.query(createTableQuery, async (err) => {
//     if (err) throw err;
//     console.log('✅ Database and table ready');

//     const totalRecords = 1_000_000;
//     const batchSize = 10_000;
//     const totalBatches = totalRecords / batchSize;

//     const insertQuery = `INSERT INTO students 
//       (full_name, age, gender, email, address, gpa, enrollment_year,gist) 
//       VALUES ?`;

//     for (let batch = 0; batch < totalBatches; batch++) {
//       const studentsBatch = [];

//       for (let i = 0; i < batchSize; i++) {
//         const uniqueEmail = `user${batch * batchSize + i}@example.com`; // ensures unique email
//         studentsBatch.push([
//           faker.person.fullName(),
//           faker.number.int({ min: 18, max: 30 }),
//           faker.helpers.arrayElement(['Male', 'Female']),
//           uniqueEmail,
//           faker.location.streetAddress(),
//           parseFloat((Math.random() * 4).toFixed(2)),
//           faker.date.anytime().getFullYear(),
//           faker.lorem.sentence(10)
//         ]);
//       }

//       await new Promise((resolve, reject) => {
//         connection.query(insertQuery, [studentsBatch], (err, result) => {
//           if (err) {
//             console.error(`❌ Error in batch ${batch + 1}:`, err);
//             reject(err);
//           } else {
//             console.log(`✅ Batch ${batch + 1}/${totalBatches} inserted (${result.affectedRows} records)`);
//             resolve();
//           }
//         });
//       });
//     }

//     console.log('✅ All 1,000,000 records inserted');
//     connection.end();
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
      id INT PRIMARY KEY,  -- 👈 no AUTO_INCREMENT now
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
      (id, full_name, age, gender, email, address, gpa, enrollment_year, gist) 
      VALUES ?`;

    for (let batch = 0; batch < totalBatches; batch++) {
      const studentsBatch = [];

      for (let i = 0; i < batchSize; i++) {
        const studentId = batch * batchSize + i + 1; // 👈 manual unique ID
        const uniqueEmail = `user${studentId}@example.com`; // 👈 syncs with ID

        studentsBatch.push([
          studentId,
          faker.person.fullName(),
          faker.number.int({ min: 18, max: 30 }),
          faker.helpers.arrayElement(['Male', 'Female']),
          uniqueEmail,
          faker.location.streetAddress(),
          parseFloat((Math.random() * 4).toFixed(2)),
          faker.date.anytime().getFullYear(),
          faker.lorem.sentence(100)
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

    console.log('✅ All 1,000,000 records inserted with manual IDs');
    connection.end();
  });
});
