import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  idMat: Number,
  quantity: Number
}, { _id: false }); // ⛔ empêche la génération automatique d'un _id par sous-document

const userSchema = new mongoose.Schema({
  idUser: { type: Number, unique: true },
  name: String,
  prename: String,

  username: { type: String, unique: true, sparse: true }, // ajouté via "donner accès"
  password: { type: String }, // sera défini uniquement avec credentials

  numSec: { type: String, required: true, unique: true, sparse: true },
  numSiret: { type: String, unique: true, sparse: true },

  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },

  address: String,
  city: String,
  postaleCode: String,
  status: String, // auto-entrepreneur ou salarié

  idDep: { type: Number, index: true },
  idVeh: { type: Number, index: true },
  role: String,
  refreshToken: { type: String, default: null }, // 🔐 Nouveau champ


  materials: [materialSchema], // tableau de ressources avec idMat et quantité
  vehicules: [Number] // optionnel si tu veux stocker plusieurs véhicules
}, { timestamps: true });

// ❌ PAS DE HASH automatique ici (on gère ça côté controller addCredentials)

export default mongoose.model('User', userSchema);
