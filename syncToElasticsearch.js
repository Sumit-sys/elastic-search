

// // syncData();
// const mysql = require('mysql2/promise');
// const { Client } = require('@elastic/elasticsearch');

// // MySQL setup
// const db = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '123456',
//   database: 'student_db',
//   waitForConnections: true,
//   connectionLimit: 10,
// });



// const esClient = new Client({
//   node: 'http://localhost:9200',
//   auth: {
//     username: 'elastic',
//     password: '123456', // <- Replace this with real password
//   },
// });

// // Batch size
// const BATCH_SIZE = 10000;

// const syncToElasticsearch = async () => {
//   try {
//     // 1. Create index if it doesn't exist
//     const indexExists = await esClient.indices.exists({ index: 'student' });
//     if (!indexExists) {
//       await esClient.indices.create({ index: 'student' });
//       console.log('✅ Created index: student');
//     }

//     // 2. Get total count from MySQL
//     const [countResult] = await db.query('SELECT COUNT(*) as count FROM students');
//     const total = countResult[0].count;
//     console.log(`📊 Total records to sync: ${total}`);

//     for (let offset = 0; offset < total; offset += BATCH_SIZE) {
//       const [rows] = await db.query(`SELECT * FROM students LIMIT ? OFFSET ?`, [BATCH_SIZE, offset]);

//       // 3. Format data for _bulk
//       const bulkBody = [];

//       rows.forEach((row) => {
//         bulkBody.push({
//           index: { _index: 'student', _id: row.id },
//         });
//         bulkBody.push({
//           full_name: row.full_name,
//           age: row.age,
//           gender: row.gender,
//           email: row.email,
//           address: row.address,
//           gpa: row.gpa,
//           enrollment_year: row.enrollment_year,
//           gist: row.gist
//         });
//       });

     
//       const bulkResponse = await esClient.bulk({ refresh: false, body: bulkBody });

// if (bulkResponse.errors) {
//   console.error(`❌ Errors in batch at offset ${offset}`);
//   bulkResponse.items.forEach((item) => {
//     if (item.index && item.index.error) {
//       console.error(item.index.error);
//     }
//   });
// } else {
//   console.log(`✅ Synced ${rows.length} records (offset ${offset})`);
// }
//     }

//     console.log('🎉 Sync to Elasticsearch complete.');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Sync failed:', error);
//     process.exit(1);
//   }
// };

// syncToElasticsearch();
const mysql = require('mysql2/promise');
const { Client } = require('@elastic/elasticsearch');

// MySQL setup
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'student_db',
  waitForConnections: true,
  connectionLimit: 10,
});

// Elasticsearch setup
const esClient = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: '123456', // 🔒 Replace with your real password
  },
});

const BATCH_SIZE = 10000; // fetch 10k rows at a time

const syncToElasticsearch = async () => {
  try {
    // 1. Create index if it doesn't exist
    const indexExists = await esClient.indices.exists({ index: 'student' });
    if (!indexExists) {
      await esClient.indices.create({
        index: 'student',
        body: {
          mappings: {
            properties: {
              id: { type: "integer" },
              full_name: { type: "text" },
              age: { type: "integer" },
              gender: { type: "keyword" },
              email: { type: "keyword" },
              address: { type: "text" },
              gpa: { type: "float" },
              enrollment_year: { type: "integer" },
              gist: { type: "text" }
            }
          }
        }
      });
      console.log('✅ Created index: student');
    }

    // 2. Get total count from MySQL
    const [countResult] = await db.query('SELECT COUNT(*) as count FROM students');
    const total = countResult[0].count;
    console.log(`📊 Total records to sync: ${total}`);

    // 3. Sync in batches
    for (let offset = 0; offset < total; offset += BATCH_SIZE) {
      const [rows] = await db.query(
        `SELECT * FROM students LIMIT ? OFFSET ?`,
        [BATCH_SIZE, offset]
      );

      const bulkBody = [];

      rows.forEach((row) => {
        bulkBody.push({
          index: { _index: 'student', _id: row.id }, // 👈 use manual ID
        });
        bulkBody.push({
          id: row.id,  // 👈 keep id as a field inside document too
          full_name: row.full_name,
          age: row.age,
          gender: row.gender,
          email: row.email,
          address: row.address,
          gpa: row.gpa,
          enrollment_year: row.enrollment_year,
          gist: row.gist
        });
      });

      const bulkResponse = await esClient.bulk({ refresh: false, body: bulkBody });

      if (bulkResponse.errors) {
        console.error(`❌ Errors in batch at offset ${offset}`);
        bulkResponse.items.forEach((item) => {
          if (item.index && item.index.error) {
            console.error(item.index.error);
          }
        });
      } else {
        console.log(`✅ Synced ${rows.length} records (offset ${offset})`);
      }
    }

    console.log('🎉 Sync to Elasticsearch complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
};

syncToElasticsearch();
