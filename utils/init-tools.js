import axios from 'axios';
import tools from './tools.json' assert { type: 'json' };

try {
  await axios.post('http://localhost:3000/tools/init', tools);
  console.log('Import réussi !');
} catch (err) {
  console.error(err.response?.data || err);
}
