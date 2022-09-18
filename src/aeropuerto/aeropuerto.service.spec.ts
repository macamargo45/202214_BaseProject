import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AeropuertoEntity } from './aeropuerto.entity';
import { AeropuertoService } from './aeropuerto.service';
import { faker } from '@faker-js/faker';

describe('AeropuertoService', () => {
  let service: AeropuertoService;
  let repository: Repository<AeropuertoEntity>;
  let aeropuertosList: AeropuertoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AeropuertoService],
    }).compile();

    service = module.get<AeropuertoService>(AeropuertoService);
    repository = module.get<Repository<AeropuertoEntity>>(
      getRepositoryToken(AeropuertoEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    repository.clear();
    aeropuertosList = [];
    for (let i = 0; i < 5; i++) {
      const aeropuerto: AeropuertoEntity = await repository.save({
        nombre: faker.word.adjective(),
        codigo: faker.lorem.word(3),
        pais: faker.address.country(),
        ciudad: faker.address.city(),
        aerolineas: [],
      });
      aeropuertosList.push(aeropuerto);
    }
  };

  it('findAll debe retornar todos los aeropuertos', async () => {
    const aeropuertos: AeropuertoEntity[] = await service.findAll();
    expect(aeropuertos).not.toBeNull();
    expect(aeropuertos).toHaveLength(aeropuertosList.length);
  });

  it('findOne debe retornar un aeropuerto por su id', async () => {
    const storedAeropuerto: AeropuertoEntity = aeropuertosList[0];
    const aeropuerto: AeropuertoEntity = await service.findOne(
      storedAeropuerto.id,
    );
    expect(aeropuerto).not.toBeNull();
    expect(aeropuerto.nombre).toEqual(storedAeropuerto.nombre);
    expect(aeropuerto.codigo).toEqual(storedAeropuerto.codigo);
    expect(aeropuerto.codigo.length).toBe(3);
    expect(aeropuerto.pais).toBe(storedAeropuerto.pais);
    expect(aeropuerto.ciudad).toBe(storedAeropuerto.ciudad);
  });

  it('findOne debe arrojar una excepción debido a un aeropuerto inexistente', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id brindado no ha sido encontrado.',
    );
  });

  it('create debería crear una nueva aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = {
      id: '',
      nombre: faker.word.adjective(),
      codigo: faker.lorem.word(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
      aerolineas: [],
    };

    const newAeropuerto: AeropuertoEntity = await service.create(aeropuerto);
    expect(newAeropuerto).not.toBeNull();

    const storedAeropuerto: AeropuertoEntity = await repository.findOne({
      where: { id: `${newAeropuerto.id}` },
    });
    expect(storedAeropuerto).not.toBeNull();
    expect(storedAeropuerto.nombre).toEqual(newAeropuerto.nombre);
    expect(storedAeropuerto.codigo).toEqual(newAeropuerto.codigo);
    expect(storedAeropuerto.codigo.length).toBe(3);
    expect(storedAeropuerto.pais).toBe(newAeropuerto.pais);
    expect(storedAeropuerto.ciudad).toBe(newAeropuerto.ciudad);
  });

  it('update debería actualizar un aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[3];
    aeropuerto.nombre = 'New name';
    aeropuerto.codigo = faker.lorem.word(3);
    const updatedAeropuerto: AeropuertoEntity = await service.update(
      aeropuerto.id,
      aeropuerto,
    );
    expect(updatedAeropuerto).not.toBeNull();
    const storedAeropuerto: AeropuertoEntity = await repository.findOne({
      where: { id: `${aeropuerto.id}` },
    });
    expect(storedAeropuerto).not.toBeNull();
    expect(storedAeropuerto.nombre).toEqual(aeropuerto.nombre);
    expect(storedAeropuerto.codigo).toEqual(aeropuerto.codigo);
    expect(storedAeropuerto.codigo.length).toBe(3);
    expect(storedAeropuerto.pais).toBe(aeropuerto.pais);
    expect(storedAeropuerto.ciudad).toBe(aeropuerto.ciudad);
  });

  it('update debería arrojar error debido a un aeropuerto inexistente', async () => {
    let aeropuerto: AeropuertoEntity = aeropuertosList[4];
    aeropuerto = {
      ...aeropuerto,
      nombre: 'New name',
      codigo: 'New description',
    };
    await expect(() => service.update('0', aeropuerto)).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id brindado no ha sido encontrado.',
    );
  });

  it('delete debería eliminar un aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[2];
    await service.delete(aeropuerto.id);
    const deletedAeropuerto: AeropuertoEntity = await repository.findOne({
      where: { id: `${aeropuerto.id}` },
    });
    expect(deletedAeropuerto).toBeNull();
  });

  it('delete debería arrojar un error debido a un aeropuerto inexistente', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    await service.delete(aeropuerto.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'El aeropuerto con el id brindado no ha sido encontrado.',
    );
  });
});
