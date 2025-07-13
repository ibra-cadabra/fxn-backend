import mongoose from 'mongoose';

const outilSchema = new mongoose.Schema({
  nom: String,
  emoji: String,
  description: String,
  category: String,
  image: String,
});

export default mongoose.model('Tool', outilSchema);
