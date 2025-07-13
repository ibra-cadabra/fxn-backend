import mongoose from 'mongoose';

export const MaterialSchema = new mongoose.Schema({
  idMat: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ['véhicule', 'outillage', 'sécurité', 'autre'],
    default: 'outillage'
  },
  state: {
    type: String,
    enum: ['neuf', 'bon', 'endommagé'],
    default: 'neuf'
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
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

// export du modèle ET du schéma
export default mongoose.model('Material', MaterialSchema);
