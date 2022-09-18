import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { AerolineaEntity } from './aerolinea.entity';
import { AerolineaService } from './aerolinea.service';

describe('AerolineaService', () => {
  let service: AerolineaService;
  let repository: Repository<AerolineaEntity>;
  let aerolineaList: AerolineaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AerolineaService],
    }).compile();

    service = module.get<AerolineaService>(AerolineaService);
    repository = module.get<Repository<AerolineaEntity>>(
      getRepositoryToken(AerolineaEntity),
    );
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    aerolineaList = [];
    for (let i = 0; i < 5; i++) {
      const aerolinea: AerolineaEntity = await repository.save({
        name: `Aerolinea ${i}`,
        description: `Description ${i}`,
        foundationDate: new Date('1991-09-05'),
        webPage: `Web Page ${i}`,
      });
      aerolineaList.push(aerolinea);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all airlines', async () => {
    const result = await service.findAll();
    expect(result).not.toBeNull();
    expect(result).toHaveLength(aerolineaList.length);
  });

  it('should return a airline by id', async () => {
    const aerolineaAlmacenada: AerolineaEntity = aerolineaList[0];
    const aerolinea = await service.findOne(aerolineaAlmacenada.id);
    expect(aerolinea).not.toBeNull();
    expect(aerolinea.name).toEqual(aerolineaAlmacenada.name);
  });

  it('findOne should throw an exception for an invalid airline', async () => {
    await expect(() => service.findOne(`0`)).rejects.toHaveProperty(
      'message',
      'La aerolinea con el id dado no existe',
    );
  });

  it('should create a airline', async () => {
    const aerolinea: AerolineaEntity = await service.create({
      id: '',
      aeropuertos: [],
      name: 'Aerolinea nuevo',
      description: 'Description',
      foundationDate: new Date('1991-09-05'),
      webPage: 'Web Page',
    });
    expect(aerolinea).not.toBeNull();
    expect(aerolinea.name).toEqual('Aerolinea nuevo');
    expect(aerolinea.description).toEqual('Description');
    expect(aerolinea.foundationDate).toEqual(new Date('1991-09-05'));
    expect(aerolinea.foundationDate.getTime()).toBeLessThan(
      new Date().getTime(),
    );
    expect(aerolinea.webPage).toEqual('Web Page');
  });

  it('should update a airline', async () => {
    const aerolineaAlmacenada = aerolineaList[0];
    aerolineaAlmacenada.name = 'Aerolinea modificada';
    const aerolinea: AerolineaEntity = await service.update(
      aerolineaAlmacenada.id,
      aerolineaAlmacenada,
    );
    expect(aerolinea).not.toBeNull();
    expect(aerolinea.name).toEqual('Aerolinea modificada');
  });

  it('update should throw an exception for an invalid airline', async () => {
    let aerolineaAlmacenada = aerolineaList[0];
    aerolineaAlmacenada = {
      ...aerolineaAlmacenada,
      name: 'Aerolinea actualizada',
    };
    await expect(() =>
      service.update(`0`, aerolineaAlmacenada),
    ).rejects.toHaveProperty(
      'message',
      'La aerolinea con el id dado no existe',
    );
  });

  it('delete should remove a airline', async () => {
    const aerolineaAlmacenada = aerolineaList[0];
    await service.delete(aerolineaAlmacenada.id);
    const aerolineaEliminado = await repository.findOne({
      where: { id: `${aerolineaAlmacenada.id}` },
    });
    expect(aerolineaEliminado).toBeNull();
  });

  it('delete should throw an exception for an invalid airline', async () => {
    await expect(() => service.delete(`0`)).rejects.toHaveProperty(
      'message',
      'La aerolinea con el id dado no existe',
    );
  });
});
