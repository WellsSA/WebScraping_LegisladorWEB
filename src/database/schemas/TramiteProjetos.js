const mongoose = require('mongoose');

const TramiteProjetosSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    data: {
      type: String,
      required: true,
    },
    situacao: {
      type: String,
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

module.exports = mongoose.model('TramiteProjetos', TramiteProjetosSchema);
