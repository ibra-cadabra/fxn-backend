// models/consumable.model.js
import mongoose from 'mongoose';


const consumableSchema = new mongoose.Schema({
  idCons: { type: Number, required: true, unique: true },
  name: String,
  quantity: Number,
  description: String,
  unitPrice: Number,
  location: String, // depot or vehicle ID
  stockAlert: Number,
  minThreshold: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  assignedQuantity: {
    type: Number,
    default: 0
  },
  assignedTo: {
    type: Number,
    default: null
  },
  idDep: {
    type: Number,
    required: true
  } 
  
});

const Consumable = mongoose.model('Consumable', consumableSchema);
export default Consumable;
