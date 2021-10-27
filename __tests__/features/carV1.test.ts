/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
import request from 'supertest';
import CarModel, { Car } from '@models/CarModel';
import factory from '../utils/CarFactory';
import MongoDatabase from '../../src/infra/mongo/index';
import app from '../../src/app';

const PREFIX = '/api/v1/car';
const carData = {
  modelo: 'GM S10 2.8',
  cor: 'Verde',
  ano: 2021,
  acessorios: [{ descricao: 'Ar-condicionado' }],
  quantidadePassageiros: 5,
};
describe('src :: api :: controllers :: car', () => {
  beforeAll(async () => {
    await CarModel.deleteMany();
  });
  afterAll(async () => {
    await MongoDatabase.disconect();
  });
  afterEach(async () => {
    await CarModel.deleteMany();
  });

  /**
     * POST CREATE
     */

  it('should create a car', async () => {
    const response = await request(app)
      .post(PREFIX)
      .send(carData);

    const car = response.body;

    expect(response.status).toBe(201);
    expect(car._id).toBeDefined();
    expect(car.dataCriacao).toBeDefined();
    expect(car.acessorios.length).toEqual(1);
    expect(car.ano).toBe(carData.ano);
    expect(car.modelo).toBe(carData.modelo);
    expect(car.cor).toBe(carData.cor);
    expect(car.quantidadePassageiros).toBe(carData.quantidadePassageiros);
  });

  it('should return 400 with details if missing an attribute', async () => {
    const temp = {
      modelo: 'GM S10 2.8',
      ano: 2021,
      acessorios: [],
      quantidadePassageiros: 5,
    };
    const response = await request(app)
      .post(PREFIX)
      .send(temp);
    const value = response.body;

    expect(response.status).toBe(400);
    expect(value).toHaveProperty('details');
    expect(value.details.length).toBeGreaterThanOrEqual(1);
    expect(value.details[0].message).toBe('"cor" is required');
  });

  it('should return 400 with details, if has no accessory', async () => {
    const temp = {
      modelo: 'GM S10 2.8',
      cor: 'Verde',
      ano: 2021,
      acessorios: [],
      quantidadePassageiros: 5,
    };
    const response = await request(app)
      .post(PREFIX)
      .send(temp);
    const value = response.body;
    expect(response.status).toBe(400);
    expect(value).toHaveProperty('details');
    expect(value.details.length).toBeGreaterThanOrEqual(1);
    expect(value.details[0].message).toBe('"acessorios" must contain at least 1 items');
  });

  it('should return 400 with details if year greater than 2022', async () => {
    const temp = {
      modelo: 'GM S10 2.8',
      cor: 'Verde',
      ano: 2023,
      acessorios: [{ descricao: 'Ar-condicionado' }],
      quantidadePassageiros: 5,
    };
    const response = await request(app)
      .post(PREFIX)
      .send(temp);

    const value = response.body;
    expect(response.status).toBe(400);
    expect(value).toHaveProperty('details');
    expect(value.details.length).toBeGreaterThanOrEqual(1);
    expect(value.details[0].message).toBe('"ano" must be less than or equal to 2022');
  });

  it('should return 400 with details if year least than 1950', async () => {
    const temp = {
      modelo: 'GM S10 2.8',
      cor: 'Verde',
      ano: 1949,
      acessorios: [{ descricao: 'Ar-condicionado' }],
      quantidadePassageiros: 5,
    };
    const response = await request(app)
      .post(PREFIX)
      .send(temp);

    const value = response.body;
    expect(response.status).toBe(400);
    expect(value).toHaveProperty('details');
    expect(value.details.length).toBeGreaterThanOrEqual(1);
    expect(value.details[0].message).toBe('"ano" must be greater than or equal to 1950');
  });

  it('should include just one if duplicated accessory', async () => {
    const temp = {
      modelo: 'GM S10 2.8',
      cor: 'Verde',
      ano: 2021,
      acessorios: [{ descricao: 'Ar-condicionado' }, { descricao: 'Ar-condicionado' }],
      quantidadePassageiros: 5,
    };
    const response = await request(app)
      .post(PREFIX)
      .send(temp);

    const car = response.body;
    expect(response.status).toBe(201);
    expect(car._id).toBeDefined();
    expect(car.dataCriacao).toBeDefined();
    expect(car.acessorios.length).toEqual(1);
    expect(car.ano).toBe(carData.ano);
    expect(car.cor).toBe(carData.cor);
    expect(car.quantidadePassageiros).toBe(carData.quantidadePassageiros);
  });

  /**
     * GET LIST
     */

  it('should get all cars', async () => {
    const carTemp = await factory.createMany<Car>('Car', 5);

    const response = await request(app)
      .get(`${PREFIX}?offset=0&limit=${carTemp.length}`);
    const vehicles = response.body;

    expect(response.status).toBe(200);
    expect(vehicles).toHaveProperty('veiculos');
    expect(vehicles.veiculos.length).toEqual(carTemp.length);
  });

  it('should get all cars by accessory', async () => {
    const carTemp = await factory.createMany<Car>('Car', 5, { acessorios: [{ descricao: 'Ar-condicionado' }] });

    const response = await request(app)
      .get(`${PREFIX}?offset=0&limit=${carTemp.length}&descricao=Ar-condicionado`);
    const vehicles = response.body;

    expect(response.status).toBe(200);
    expect(vehicles).toHaveProperty('veiculos');
    expect(vehicles).toHaveProperty('total');
    expect(vehicles).toHaveProperty('limit');
    expect(vehicles).toHaveProperty('offset');
    expect(vehicles).toHaveProperty('offsets');
    expect(vehicles.veiculos.length).toEqual(carTemp.length);
    vehicles.veiculos.forEach((element: Car) => {
      expect(element.acessorios).toEqual([{ descricao: 'Ar-condicionado' }]);
    });
  });

  it('should get all cars by modelo', async () => {
    const carTemp = await factory.createMany<Car>('Car', 5);
    const response = await request(app)
      .get(`${PREFIX}?modelo=${carTemp[0].modelo}`);
    const vehicles = response.body;

    expect(response.status).toBe(200);
    expect(vehicles).toHaveProperty('veiculos');
    expect(vehicles).toHaveProperty('total');
    expect(vehicles).toHaveProperty('limit');
    expect(vehicles).toHaveProperty('offset');
    expect(vehicles).toHaveProperty('offsets');
    expect(vehicles.veiculos.length).toEqual(5);
  });

  it('should not get any cars', async () => {
    const carTemp = await factory.createMany<Car>('Car', 5);
    const response = await request(app)
      .get(`${PREFIX}?modelo=Chevy`);
    const vehicles = response.body;

    expect(response.status).toBe(200);
    expect(vehicles).toHaveProperty('veiculos');
    expect(vehicles).toHaveProperty('total');
    expect(vehicles).toHaveProperty('limit');
    expect(vehicles).toHaveProperty('offset');
    expect(vehicles).toHaveProperty('offsets');
    expect(vehicles.veiculos.length).toEqual(0);
  });

  /**
     * GET BY ID
     */

  it("should get a car by it's ID", async () => {
    const carUsed = await factory.create<Car>('Car');

    if (carUsed.id) {
      const response = await request(app)
        .get(`${PREFIX}/${carUsed.id}`);
      const car = response.body;

      expect(response.status).toBe(200);
      expect(car._id).toBe(carUsed.id);
      expect(car.modelo).toBe(carUsed.modelo);
      expect(car.ano).toBe(carUsed.ano);
      expect(car.cor).toBe(carUsed.cor);
    } else {
      expect(carUsed.id).toBeDefined();
    }
  });

  it('should return 400 with message if ID is invalid when searching', async () => {
    const response = await request(app)
      .get(`${PREFIX}/12`);
    const car = response.body;

    expect(response.status).toBe(400);
    expect(car).toHaveProperty('message');
    expect(car.message).toBe("O campo 'id' está fora do formato padrão");
  });

  it('should return 404 with message if ID is not found when searching', async () => {
    const response = await request(app)
      .get(`${PREFIX}/6171508962f47a7a91938d30`);
    const car = response.body;

    expect(response.status).toBe(404);
    expect(car).toHaveProperty('message');
    expect(car.message).toBe('Valor 6171508962f47a7a91938d30 não encontrado');
  });

  /**
     * DELETE BY ID
     */

  it("should remove a car by it's ID", async () => {
    const carUsed = await factory.create<Car>('Car');

    if (carUsed.id) {
      const response = await request(app)
        .delete(`${PREFIX}/${carUsed.id}`);
      const car = response.body;

      expect(response.status).toBe(204);
      expect(car).toEqual({});
    } else {
      expect(carUsed.id).toBeDefined();
    }
  });

  it('should return 400 with message if ID is invalid when removing', async () => {
    const response = await request(app)
      .delete(`${PREFIX}/12`);
    const car = response.body;

    expect(response.status).toBe(400);
    expect(car).toHaveProperty('message');
    expect(car.message).toBe("O campo 'id' está fora do formato padrão");
  });

  it('should return 404 with message if ID is notfound when removing', async () => {
    const response = await request(app)
      .delete(`${PREFIX}/6171508962f47a7a91938d30`);
    const car = response.body;

    expect(response.status).toBe(404);
    expect(car).toHaveProperty('message');
    expect(car.message).toBe('Valor 6171508962f47a7a91938d30 não encontrado');
  });

  /**
     * PUT BY ID
     */

  it('should update a car', async () => {
    const temp = await factory.create<Car>('Car');
    const response = await request(app)
      .put(`${PREFIX}/${temp.id}`)
      .send(carData);
    const result = response.body;

    expect(response.status).toBe(200);
    expect(carData.acessorios).toEqual(result.acessorios);
    expect(carData.ano).toBe(result.ano);
    expect(carData.modelo).toBe(result.modelo);
    expect(carData.cor).toBe(result.cor);
    expect(carData.acessorios).toEqual(result.acessorios);
    expect(carData.quantidadePassageiros).toBe(result.quantidadePassageiros);
  });

  it('should return 400 with details if no accessory item exists when updating', async () => {
    const temp = await factory.create<Car>('Car');
    const tempData = {
      modelo: 'GM S10 2.8',
      cor: 'Verde',
      ano: 2021,
      acessorios: [],
      quantidadePassageiros: 5,
    };
    const response = await request(app)
      .put(`${PREFIX}/${temp.id}`)
      .send(tempData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('details');
    expect(response.body.details.length).toBeGreaterThanOrEqual(1);
    expect(response.body.details[0].message).toBe('"acessorios" must contain at least 1 items');
  });

  it('should return 400 with details if year greater than 2022 when updating', async () => {
    const temp = await factory.create<Car>('Car');
    const tempData = {
      modelo: 'GM S10 2.8',
      cor: 'Verde',
      ano: 2023,
      acessorios: [{ descricao: 'Ar-condicionado' }],
      quantidadePassageiros: 5,
    };
    const response = await request(app)
      .put(`${PREFIX}/${temp.id}`)
      .send(tempData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('details');
    expect(response.body.details.length).toBeGreaterThanOrEqual(1);
    expect(response.body.details[0].message).toBe('"ano" must be less than or equal to 2022');
  });

  it('should return 400 with details if year least than 1950 when updating', async () => {
    const temp = await factory.create<Car>('Car');
    const tempData = {
      modelo: 'GM S10 2.8',
      cor: 'Verde',
      ano: 1949,
      acessorios: [{ descricao: 'Ar-condicionado' }],
      quantidadePassageiros: 5,
    };
    const response = await request(app)
      .put(`${PREFIX}/${temp.id}`)
      .send(tempData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('details');
    expect(response.body.details.length).toBeGreaterThanOrEqual(1);
    expect(response.body.details[0].message).toBe('"ano" must be greater than or equal to 1950');
  });

  it('should update if accessory has duplicated item but include just one when updating', async () => {
    const temp = await factory.create<Car>('Car');
    const tempData = {
      modelo: 'GM S10 2.8',
      cor: 'Verde',
      ano: 2018,
      acessorios: [{ descricao: 'Ar-condicionado' }, { descricao: 'Ar-condicionado' }],
      quantidadePassageiros: 5,
    };
    const response = await request(app)
      .put(`${PREFIX}/${temp.id}`)
      .send(tempData);
    const getted = response.body;

    expect(response.status).toBe(200);
    expect(getted.acessorios).toEqual([{ descricao: 'Ar-condicionado' }]);
    expect(getted.ano).toBe(tempData.ano);
    expect(getted.modelo).toBe(tempData.modelo);
    expect(getted.cor).toBe(tempData.cor);
    expect(getted.quantidadePassageiros).toBe(tempData.quantidadePassageiros);
  });

  it('should return 400 with message if empty body when updating', async () => {
    const temp = await factory.create<Car>('Car');
    const response = await request(app)
      .put(`${PREFIX}/${temp.id}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('details');
    expect(response.body.details.length).toBeGreaterThanOrEqual(1);
    expect(response.body.details[0].message).toBe('"modelo" is required');
  });
});
