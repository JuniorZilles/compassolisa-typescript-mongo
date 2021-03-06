import Accessory from '@interfaces/car/Accessory';
import Car from '@interfaces/car/Car';
import { Paginate } from '@interfaces/Paginate';
import Vehicles from '@interfaces/car/Vehicle';

export const serializeAccessory = ({ _id, descricao }: Accessory): Accessory => {
  return {
    _id,
    descricao
  };
};

export const serializeCar = ({ _id, modelo, cor, ano, acessorios, quantidadePassageiros }: Car): Car => {
  return {
    _id,
    modelo,
    cor,
    ano,
    acessorios: acessorios.map(serializeAccessory),
    quantidadePassageiros
  };
};

export const paginateCar = ({ docs, offsets, total, offset, limit }: Paginate<Car>): Vehicles => {
  return {
    veiculos: docs.map(serializeCar),
    offsets,
    total,
    offset,
    limit
  };
};
