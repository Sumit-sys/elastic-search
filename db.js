
const mysql = require('mysql2');

const { faker } = require('@faker-js/faker');


// MySQL config — change credentials if needed
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456', // 🔒 change this!
  
  database: 'student_db',
  multipleStatements: true,
});

// Connect to MySQL
connection.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');

  // Create database and table
  const createDatabaseAndTable = `
    CREATE DATABASE IF NOT EXISTS studentdb;
    USE studentdb;
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100),
      age INT,
      gender VARCHAR(20),
      email VARCHAR(100) UNIQUE,
      address TEXT,
      gpa FLOAT,
      enrollment_year INT
    );
  `;

  connection.query(createDatabaseAndTable, err => {
    if (err) throw err;
    console.log('✅ Database and table ready');

    // Generate and insert 500 fake students
    const genders = ['Male', 'Female', 'Non-binary', 'Other'];
    const students = [];

   
    // }
    const { faker } = require('@faker-js/faker');

for (let i = 0; i < 500; i++) {
  const full_name = faker.person.fullName();
  const age = faker.number.int({ min: 17, max: 25 }); // ✅ correct
  const gender = genders[Math.floor(Math.random() * genders.length)];
  const email = faker.internet.email();
  const address = `${faker.location.streetAddress()}, ${faker.location.city()}`; // ✅ updated from address
  const gpa = parseFloat((Math.random() * (4.0 - 2.0) + 2.0).toFixed(2));
  const enrollment_year = faker.number.int({ min: 2018, max: 2025 }); // ✅ correct

  students.push([full_name, age, gender, email, address, gpa, enrollment_year]);
}


console.log(students)

    const insertQuery = `
      INSERT INTO students (full_name, age, gender, email, address, gpa, enrollment_year)
      VALUES ?
    `;

    connection.query(insertQuery, [students], (err, result) => {
      if (err) throw err;
      console.log(`✅ Inserted ${result.affectedRows} student records`);
      connection.end();
    });
  });
});
