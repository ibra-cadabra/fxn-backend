// models/attribution.model.js
import mongoose from 'mongoose';

const attributionSchema = new mongoose.Schema({
  idAttri: Number,
  resourceType: { type: String, enum: ['materiel', 'consommable', 'vehicule'], required: true },
  resourceId: String,
  technicianId: Number,
  depotId: Number,
  createdBy: { type: Number, required: true }, // L’auteur de l’attribution
  date: { type: Date, default: Date.now },
  comment: { type: String, default: '' },
  action: { type: String, enum: ['attribution', 'reprise'], required: true },
  quantity: {
    type: Number,
    default: 0
  }
});

const Attribution = mongoose.model('Attribution', attributionSchema);
export default Attribution;
