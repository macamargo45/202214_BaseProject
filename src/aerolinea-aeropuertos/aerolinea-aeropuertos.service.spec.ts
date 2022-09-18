import { Test, TestingModule } from '@nestjs/testing';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AerolineaAeropuertoService } from './aerolinea-aeropuertos.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';

describe('AerolineaAeropuertoService', () => {
  let service: AerolineaAeropuertoService;
  let aerolineaRepository: Repository<AerolineaEntity>;
  let aeropuertoRepository: Repository<AeropuertoEntity>;
  let aerolinea: AerolineaEntity;
  let listAirport: AeropuertoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AerolineaAeropuertoService],
    }).compile();

    service = module.get<AerolineaAeropuertoService>(
      AerolineaAeropuertoService,
    );
    aerolineaRepository = module.get(getRepositoryToken(AerolineaEntity));
    aeropuertoRepository = module.get(getRepositoryToken(AeropuertoEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    aerolineaRepository.clear();
    aeropuertoRepository.clear();

    //create aeropuertosList
    listAirport = [];
    for (let i = 0; i < 5; i++) {
      const aeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
        nombre: `aeropuerto${i}`,
        codigo: faker.lorem.word(3),
        pais: faker.address.country(),
        ciudad: faker.address.city(),
      });
      listAirport.push(aeropuerto);
    }

    //create aerolinea
    aerolinea = await aerolineaRepository.save({
      name: 'Aerolinea nuevo',
      description: 'Description',
      foundationDate: new Date('1991-09-05'),
      webPage: 'Web Page',
      aeropuertos: listAirport,
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should associate a airport to a airline', async () => {
    const airport = await aeropuertoRepository.save({
      id: '',
      nombre: faker.word.adjective(),
      codigo: faker.lorem.word(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
      aerolineas: [],
    });

    const aerolinea = await aerolineaRepository.save({
      id: '',
      aeropuertos: [],
      name: 'Aerolinea nuevo',
      description: 'Description',
      foundationDate: new Date('1991-09-05'),
      webPage: 'Web Page',
    });

    const result = await service.addAirportToAirline(aerolinea.id, airport.id);

    expect(result.aeropuertos.length).toBe(1);
    expect(result.aeropuertos[0]).not.toBeNull();
    expect(result.aeropuertos[0].id).toBe(airport.id);
    expect(result.aeropuertos[0].nombre).toBe(airport.nombre);
    expect(result.aeropuertos[0].codigo).toBe(airport.codigo);
    expect(result.aeropuertos[0].codigo.length).toBe(3);
    expect(result.aeropuertos[0].pais).toBe(airport.pais);
    expect(result.aeropuertos[0].ciudad).toBe(airport.ciudad);
  });

  it('associate should thow an error for an invalid airport', async () => {
    const aerolinea = await aerolineaRepository.save({
      aeropuertos: [],
      name: 'Aerolinea nuevo',
      description: 'Description',
      foundationDate: new Date('1991-09-05'),
      webPage: 'Web Page',
    });

    try {
      await service.addAirportToAirline(aerolinea.id, '999999');
    } catch (error) {
      expect(error.message).toBe('El aeropuerto con el id dado no existe');
    }
  });

  it('associate should thow an error for an invalid airline', async () => {
    const airport = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.lorem.word(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
    });

    try {
      await service.addAirportToAirline('999999', airport.id);
    } catch (error) {
      expect(error.message).toBe('La aerolinea con el id dado no existe');
    }
  });

  it('should findAirportFromAirline', async () => {
    const aeropuerto: AeropuertoEntity = listAirport[0];
    const storedAirport = await service.findAirportFromAirline(
      aerolinea.id,
      aeropuerto.id,
    );

    expect(storedAirport).not.toBeNull();
    expect(storedAirport.id).toBe(aeropuerto.id);
    expect(storedAirport.nombre).toBe(aeropuerto.nombre);
    expect(storedAirport.codigo).toBe(aeropuerto.codigo);
    expect(storedAirport.codigo.length).toBe(3);
    expect(storedAirport.pais).toBe(aeropuerto.pais);
    expect(storedAirport.ciudad).toBe(aeropuerto.ciudad);
  });

  it('should findAirportFromAirline throw an error for an invalid airline', async () => {
    const aeropuerto: AeropuertoEntity = listAirport[0];

    try {
      await service.findAirportFromAirline('999999', aeropuerto.id);
    } catch (error) {
      expect(error.message).toBe('La aerolinea con el id dado no existe');
    }
  });

  it('should findAirportFromAirline throw an error for an invalid airport', async () => {
    try {
      await service.findAirportFromAirline(aerolinea.id, '999999');
    } catch (error) {
      expect(error.message).toBe('El aeropuerto con el id dado no existe');
    }
  });

  it('should findAirportFromAirline throw an error for a airport not associated to airline', async () => {
    const aeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.lorem.word(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
    });

    try {
      await service.findAirportFromAirline(aerolinea.id, aeropuerto.id);
    } catch (error) {
      expect(error.message).toBe(
        'El aeropuerto con el id dado no esta asociada a la aerolinea',
      );
    }
  });

  it('should findAirportsFromAirline', async () => {
    const storedAirports = await service.findAirportsFromAirline(aerolinea.id);

    const storedAirport = storedAirports.find(
      (storedAirport) => storedAirport.nombre === 'aeropuerto0',
    );

    const itemAirport = listAirport.find(
      (itemAirport) => itemAirport.nombre === 'aeropuerto0',
    );

    expect(storedAirports.length).toBe(listAirport.length);
    expect(storedAirport.id).toBe(itemAirport.id);
    expect(storedAirport.nombre).toBe(itemAirport.nombre);
    expect(storedAirport.codigo).toBe(itemAirport.codigo);
    expect(storedAirport.codigo.length).toBe(3);
    expect(storedAirport.pais).toBe(itemAirport.pais);
    expect(storedAirport.ciudad).toBe(itemAirport.ciudad);
  });

  it('should updateAirportsFromAirline update the list of airports', async () => {
    const newAirport = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.lorem.word(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
    });

    const result = await service.updateAirportsFromAirline(aerolinea.id, [
      newAirport,
    ]);

    expect(result.aeropuertos.length).toBe(1);
    expect(result.aeropuertos[0].id).toBe(newAirport.id);
    expect(result.aeropuertos[0].nombre).toBe(newAirport.nombre);
    expect(result.aeropuertos[0].codigo).toBe(newAirport.codigo);
    expect(result.aeropuertos[0].codigo.length).toBe(3);
    expect(result.aeropuertos[0].pais).toBe(newAirport.pais);
    expect(result.aeropuertos[0].ciudad).toBe(newAirport.ciudad);
  });

  it('should updateAirportsFromAirline throw an error for an invalid airline', async () => {
    const newAirport = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.lorem.word(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
    });

    try {
      await service.updateAirportsFromAirline('999999', [newAirport]);
    } catch (error) {
      expect(error.message).toBe('La aerolinea con el id dado no existe');
    }
  });

  it('should updateAirportsFromAirline throw an error for an invalid airport', async () => {
    const aeropuerto = listAirport[0];
    aeropuerto.id = '999999';
    try {
      await service.updateAirportsFromAirline(aerolinea.id, [aeropuerto]);
    } catch (error) {
      expect(error.message).toBe('El aeropuerto con el id dado no existe');
    }
  });

  it('deleteAirportFromAirline should dissociate a airport from a airline', async () => {
    const aeropuerto = listAirport[0];
    await service.deleteAirportFromAirline(aerolinea.id, aeropuerto.id);

    const storedAerolinea = await aerolineaRepository.findOne({
      where: { id: `${aerolinea.id}` },
      relations: ['aeropuertos'],
    });
    const deletedAirport = storedAerolinea.aeropuertos.find(
      (c) => c.id === aeropuerto.id,
    );

    expect(deletedAirport).toBeUndefined();
  });

  it('deleteAirportFromAirline should throw an error for an invalid airline', async () => {
    const aeropuerto = listAirport[0];
    try {
      await service.deleteAirportFromAirline('999999', aeropuerto.id);
    } catch (error) {
      expect(error.message).toBe('La aerolinea con el id dado no existe');
    }
  });

  it('deleteAirportFromAirline should throw an error for an invalid airport', async () => {
    try {
      await service.deleteAirportFromAirline(aerolinea.id, '999999');
    } catch (error) {
      expect(error.message).toBe('El aeropuerto con el id dado no existe');
    }
  });

  it('deleteAirportFromAirline should throw an error for a airport not associated to airline', async () => {
    const aeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.lorem.word(3),
      pais: faker.address.country(),
      ciudad: faker.address.city(),
    });

    try {
      await service.deleteAirportFromAirline(aerolinea.id, aeropuerto.id);
    } catch (error) {
      expect(error.message).toBe(
        'El aeropuerto con el id dado no esta asociada al aerolinea',
      );
    }
  });
});
