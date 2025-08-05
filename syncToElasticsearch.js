const mysql = require('mysql2');
const { Client } = require('@elastic/elasticsearch');

// 1. Connect to MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'studentdb',
});

// 2. Connect to Elasticsearch
const esClient = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: '123456', // <- Replace this with real password
  },
});

// 3. Sync Function
async function syncData() {
  connection.query('SELECT * FROM students', async (err, results) => {
    if (err) {
      console.error('❌ MySQL error:', err);
      return;
    }

    console.log(`📦 Found ${results.length} student records in MySQL.`);

    const body = results.flatMap(student => [
      { index: { _index: 'students', _id: student.id } },
      student,
    ]);

    try {
      const response = await esClient.bulk({
        refresh: true,
        body,
      });

      // ✅ SAFELY CHECK if response is valid
      if (!response || typeof response !== 'object') {
        console.error('❌ Invalid response from Elasticsearch:', response);
        return;
      }

      if (response.errors) {
        console.error('❌ Some documents failed to index:');
        response.items.forEach((item, i) => {
          if (item.index && item.index.error) {
            console.log(`Error on record ${i}:`, item.index.error);
            

          }
        });
      } else {
        console.log('✅ All documents indexed successfully to Elasticsearch!');
      }
    } catch (e) {
      console.error('❌ Elasticsearch error:', e.message);
    } finally {
      connection.end();
    }
  });
}

syncData();
