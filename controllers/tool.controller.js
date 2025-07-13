import Tool from '../models/tool.model.js';
// Initialiser les outils à partir d'un JSON
export const initTools = async (req, res) => {
  try {
    await Tool.deleteMany({}); // Réinitialiser
    const entries = Object.entries(req.body);

    const tools = entries.map(([key, outils]) => ({
      nomCategorie: key,
      outils
    }));

    await Tool.insertMany(tools);
    res.status(201).json({ message: 'Outils initialisés avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l’initialisation.' });
  }
};

// Obtenir toutes les catégories et leurs outils
export const getAllTools = async (req, res) => {
  try {
    const tools = await Tool.find();
    console.log('Outils récupérés:', tools);
    res.json(tools);
  } catch (err) {
    console.error('Erreur lors du chargement des outils:', err);
    res.status(500).json({ message: 'Erreur lors du chargement des outils.' });
  }
};

// Mettre à jour une catégorie ou un outil
export const updateToolCategory = async (req, res) => {
  const { id } = req.params;
  const { nomCategorie, outils } = req.body;

  try {
    const updated = await ToolCategory.findByIdAndUpdate(
      id,
      { nomCategorie, outils },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
};
