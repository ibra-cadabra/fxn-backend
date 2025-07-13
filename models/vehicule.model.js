import mongoose from 'mongoose';

export const VehiculeSchema = new mongoose.Schema({
  idVeh: {type: Number, required: true, unique: true},
  status: {type: String, enum: ['depot', 'technician']},
  brand: {    type: String,    required: true,    trim: true},
  model: {    type: String,    trim: true,},
  registrationPlate: {
    type: String,
    required: true,
    unique: true,
    uppercase: true, // 🔁 optionnel, mais utile
    trim: true
  },
  buyState: {    type: String,    enum: ['neuf', 'bon', 'maintenance'],    default: 'bon'  },
  nowState: {    type: String,    enum: ['neuf', 'bon', 'maintenance'],    default: 'bon'  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  assignedQuantity: {
    type: Number,
    default: 0
  },
  // 👷 Technicien à qui le véhicule est attribué (nullable)
  idTec: {
    type: Number,
    required: function () {
      // 🟡 idTec est requis si idDep est nul
      return this.idDep == null;
    },
    default: null,
  },
  // 🏢 Dépôt auquel le véhicule est rattaché (nullable)
  idDep: {
    type: Number,
    required: function () {
      // 🟡 idDep est requis si idTec est nul
      return this.idTec == null;
    },
    default: null,
  },
});

export default mongoose.model('Vehicule', VehiculeSchema);
