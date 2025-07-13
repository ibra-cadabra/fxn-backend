import mongoose from 'mongoose';

const depotSchema = new mongoose.Schema({
  idDep: { type: Number, required: true, unique: true },
  idUser: { type: Number, unique: true },
  name: { type: String, required: true},
  location: String,
  city: String,
  postaleCode: String,
  address: String,
  phone: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
  managedBy: Number
});

export default mongoose.model('Depot', depotSchema);
