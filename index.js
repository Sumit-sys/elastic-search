
// const express = require('express');
// const { Client } = require('@elastic/elasticsearch');
// const app = express();
// const port = 3000;
// const bodyParser = require('body-parser');
// app.use(bodyParser.json());

// // Required to parse JSON bodies (if needed)
// app.use(express.json());

// // ✅ 1. Define Elasticsearch client FIRST
// const esClient = new Client({
//   node: 'http://localhost:9200',
//   auth: {
//     username: 'elastic',
//     password: '123456', // Replace with your real password
//   },
// });

// // ✅ 2. Add test route (optional)
// app.get('/', (req, res) => {
//   res.send('✅ Elasticsearch Search API is running!');
// });






// app.post('/search', async (req, res) => {
//   const keyword = req.body.keyword || '';

//   try {
//     const result = await esClient.search({
//       index: 'student',
//       body: {
//         size: 10000,
//         query: {
//           query_string: {
//             query: keyword,
//             fields: [
//               "id",
//               "full_name",
//               "email",
//               "address",
//               "gender",
//               "age",
//               "gpa",
//               "enrollment_year",
//               "gist" 
//             ],
//             lenient: true
//           }
//         }
//       }
//     });

//     // For better logging of nested objects:
//     console.dir(result, { depth: null, colors: true });

//     if (result && result.hits && result.hits.hits) {
//       res.json(result.hits.hits);
//     } else {
//       console.error('Unexpected Elasticsearch response format:', result);
//       res.status(500).json({ error: 'Invalid search response' });
//     }
//   } catch (err) {
//     console.error('Search error:', err);
//     res.status(500).json({ error: 'Search failed' });
//   }

// });


// // ✅ 4. Start the server
// app.listen(port, () => {
//   console.log(`🚀 Search API running at http://localhost:${port}`);
// });
const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// ✅ Elasticsearch client
const esClient = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',     // hard-coded username
    password: '123456',      // hard-coded password
  },
});

// ✅ Test route
app.get('/', (req, res) => {
  res.send('✅ Elasticsearch Search API is running!');
});

// ✅ Search API
app.post('/search', async (req, res) => {
  const keyword = req.body.keyword || '';

  try {
    const result = await esClient.search({
      index: 'student',
      body: {
        size: 10000,
        query: {
          query_string: {
            query: keyword,
            fields: [
              "id",
              "full_name",
              "email",
              "address",
              "gender",
              "age",
              "gpa",
              "enrollment_year",
              "gist"
            ],
            lenient: true
          }
        }
      }
    });

    // Send clean response
    if (result?.hits?.hits) {
      const formatted = result.hits.hits.map(hit => ({
        id: hit._id,
        score: hit._score,
        ...hit._source
      }));
      res.json(formatted);
    } else {
      res.status(404).json({ error: 'No results found' });
    }

  } catch (err) {
    console.error('❌ Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Search API running at http://localhost:${port}`);
});
