// ✅ index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import materialRoutes from './routes/material.routes.js';
import consumableRoutes from './routes/consumable.routes.js';
import vehiculeRoutes from './routes/vehicule.routes.js';
import depotRoutes from './routes/depot.routes.js';
import attributionRoutes from './routes/attribution.routes.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import alertRoutes from "./routes/alert.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/alerts', alertRoutes); // 💡 accessible sur /alerts/consumables
app.use('/auth', authRoutes);
app.use('/depots', depotRoutes);
app.use('/vehicules', vehiculeRoutes);
app.use('/materials', materialRoutes);
app.use('/consumables', consumableRoutes);
app.use('/attributions', attributionRoutes);
app.use('/users', userRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB :', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
});