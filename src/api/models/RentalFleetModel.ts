import { RentalFleet } from '@interfaces/rental/fleet/RentalFleet';
import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const RentalFleetSchema = new mongoose.Schema({
  id_carro: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
  id_locadora: { type: Schema.Types.ObjectId, ref: 'Rental', required: true },
  status: { type: String, required: true, enum: ['disponível', 'indisponível'] },
  placa: { type: String, required: true, unique: true },
  valor_diaria: { type: Number, required: true },
  dataCriacao: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  dataAtualizacao: {
    type: Date,
    default: Date.now
  }
});
RentalFleetSchema.plugin(mongoosePaginate);
RentalFleetSchema.pre('findOneAndUpdate', async function onSave(next) {
  this.set('dataAtualizacao', new Date());
  next();
});

export default mongoose.model<RentalFleet>('RentalFleet', RentalFleetSchema);
