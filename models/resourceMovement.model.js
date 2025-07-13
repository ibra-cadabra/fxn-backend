import mongoose from 'mongoose';

const resourceMovementSchema = new mongoose.Schema({
    resourceType: {
        type: String,
        enum: ['consommable', 'materiel', 'vehicule'],
        required: true
    },
    resourceId: { type: mongoose.Schema.Types.Mixed, required: true }, // _id ou idMat / idCons...
    resourceName: { type: String, required: true },

    depotId: { type: Number, required: true },
    movementType: {
        type: String,
        enum: ['ajout', 'retrait', 'modification', 'sortie', 'entrée'],
        required: true
    },

    quantity: { type: Number }, // facultatif pour véhicule
    date: { type: Date, default: Date.now },
    createdBy: { type: Number, required: true },
    comment: { type: String }
});
const ResourceMovement = mongoose.model('ResourceMovement', resourceMovementSchema);

export default ResourceMovement;