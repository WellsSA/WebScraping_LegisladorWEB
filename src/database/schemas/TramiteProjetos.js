const mongoose = require('../../config/mongodb');

const TramiteProjetosSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    data: {
      type: Date,
      required: true,
    },
    situacao: {
      type: Boolean,
      required: true,
      default: false,
    },
    assunto: {
      type: String,
      required: true,
    },
    autor: {
      type: String,
      required: true,
    },
    ementa: {
      type: String,
      required: true,
    },
    tramite: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('TramiteProjetosSchema', TramiteProjetosSchema);
