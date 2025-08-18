// const mysql = require('mysql2');
// const { Client } = require('@elastic/elasticsearch');

// // 1. Connect to MySQL
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '123456',
//   database: 'student_db',
// });

// // 2. Connect to Elasticsearch
// const esClient = new Client({
//   node: 'http://localhost:9200',
//   auth: {
//     username: 'elastic',
//     password: '123456', // <- Replace this with real password
//   },
// });

// // 3. Sync Function
// async function syncData() {
//   connection.query('SELECT * FROM students', async (err, results) => {
//     if (err) {
//       console.error('❌ MySQL error:', err);
//       return;
//     }

//     console.log(`📦 Found ${results.length} student records in MySQL.`);

//     const body = results.flatMap(student => [
//       { index: { _index: 'student', _id: student.id } },
//       student,
//     ]);

//     try {
//       const response = await esClient.bulk({
//         refresh: true,
//         body,
//       });

//       // ✅ SAFELY CHECK if response is valid
//       if (!response || typeof response !== 'object') {
//         console.error('❌ Invalid response from Elasticsearch:', response);
//         return;
//       }

//       if (response.errors) {
//         console.error('❌ Some documents failed to index:');
//         response.items.forEach((item, i) => {
//           if (item.index && item.index.error) {
//             console.log(`Error on record ${i}:`, item.index.error);
            

//           }
//         });
//       } else {
//         console.log('✅ All documents indexed successfully to Elasticsearch!');
//       }
//     } catch (e) {
//       console.error('❌ Elasticsearch error:', e.message);
//     } finally {
//       connection.end();
//     }
//   });
// }

// syncData();
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

// Elasticsearch client
// const esClient = new Client({ node: 'http://localhost:9200' 
//   auth: {
//     username: 'elastic',
//     password: '123456', // 🔐 Replace with real password
//   }
// });

const esClient = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: '123456', // <- Replace this with real password
  },
});

// Batch size
const BATCH_SIZE = 10000;

const syncToElasticsearch = async () => {
  try {
    // 1. Create index if it doesn't exist
    const indexExists = await esClient.indices.exists({ index: 'student' });
    if (!indexExists) {
      await esClient.indices.create({ index: 'student' });
      console.log('✅ Created index: student');
    }

    // 2. Get total count from MySQL
    const [countResult] = await db.query('SELECT COUNT(*) as count FROM students');
    const total = countResult[0].count;
    console.log(`📊 Total records to sync: ${total}`);

    for (let offset = 0; offset < total; offset += BATCH_SIZE) {
      const [rows] = await db.query(`SELECT * FROM students LIMIT ? OFFSET ?`, [BATCH_SIZE, offset]);

      // 3. Format data for _bulk
      const bulkBody = [];

      rows.forEach((row) => {
        bulkBody.push({
          index: { _index: 'student', _id: row.id },
        });
        bulkBody.push({
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

      // 4. Send bulk request
      // const { body: bulkResponse } = await esClient.bulk({ refresh: false, body: bulkBody });

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
