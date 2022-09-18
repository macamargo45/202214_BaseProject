import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';

@Injectable()
export class AerolineaAeropuertoService {
  constructor(
    @InjectRepository(AerolineaEntity)
    private readonly aerolineaRepository: Repository<AerolineaEntity>,

    @InjectRepository(AeropuertoEntity)
    private readonly aeropuertoRepository: Repository<AeropuertoEntity>,
  ) {}

  async addAirportToAirline(
    idAerolinea: string,
    idAeropuerto: string,
  ): Promise<AerolineaEntity> {
    const aerolinea = await this.aerolineaRepository.findOne({
      where: { id: `${idAerolinea}` },
      relations: ['aeropuertos'],
    });
    const aeropuerto = await this.aeropuertoRepository.findOne({
      where: { id: `${idAeropuerto}` },
    });
    if (!aerolinea) {
      throw new BusinessLogicException(
        'La aerolinea con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    }
    if (!aeropuerto) {
      throw new BusinessLogicException(
        'El aeropuerto con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    }
    aerolinea.aeropuertos = [...aerolinea.aeropuertos, aeropuerto];
    return await this.aerolineaRepository.save(aerolinea);
  }

  async findAirportFromAirline(
    idAerolinea: string,
    idAeropuerto: string,
  ): Promise<AeropuertoEntity> {
    const aerolinea = await this.aerolineaRepository.findOne({
      where: { id: `${idAerolinea}` },
      relations: ['aeropuertos'],
    });
    const aeropuerto = await this.aeropuertoRepository.findOne({
      where: { id: `${idAeropuerto}` },
    });
    if (!aerolinea) {
      throw new BusinessLogicException(
        'La aerolinea con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    }
    if (!aeropuerto) {
      throw new BusinessLogicException(
        'El aeropuerto con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    }

    const aerolineaAeropuerto: AeropuertoEntity = aerolinea.aeropuertos.find(
      (aeropuerto) => aeropuerto.id === idAeropuerto,
    );

    if (!aerolineaAeropuerto) {
      throw new BusinessLogicException(
        'El aeropuerto con el id dado no esta asociada a la aerolinea',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    return aerolineaAeropuerto;
  }

  async findAirportsFromAirline(idAerolinea: string) {
    const aerolinea = await this.aerolineaRepository.findOne({
      where: { id: `${idAerolinea}` },
      relations: ['aeropuertos'],
    });
    if (!aerolinea) {
      throw new BusinessLogicException(
        'La aerolinea con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    }
    return aerolinea.aeropuertos;
  }

  async updateAirportsFromAirline(
    idAerolinea: string,
    aeropuertos: AeropuertoEntity[],
  ) {
    const aerolinea = await this.aerolineaRepository.findOne({
      where: { id: `${idAerolinea}` },
      relations: ['aeropuertos'],
    });
    if (!aerolinea) {
      throw new BusinessLogicException(
        'La aerolinea con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    }

    for (const aeropuerto of aeropuertos) {
      const aeropuertoFound = await this.aeropuertoRepository.findOne({
        where: { id: `${aeropuerto.id}` },
      });
      if (!aeropuertoFound) {
        throw new BusinessLogicException(
          'El aeropuerto con el id dado no existe',
          BusinessError.NOT_FOUND,
        );
      }
    }

    aerolinea.aeropuertos = aeropuertos;
    return await this.aerolineaRepository.save(aerolinea);
  }

  async deleteAirportFromAirline(idAerolinea: string, idAeropuerto: string) {
    const aerolinea = await this.aerolineaRepository.findOne({
      where: { id: `${idAerolinea}` },
      relations: ['aeropuertos'],
    });
    const aeropuerto = await this.aeropuertoRepository.findOne({
      where: { id: `${idAeropuerto}` },
      relations: ['aerolineas'],
    });
    if (!aerolinea) {
      throw new BusinessLogicException(
        'La aerolinea con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    }
    if (!aeropuerto) {
      throw new BusinessLogicException(
        'El aeropuerto con el id dado no existe',
        BusinessError.NOT_FOUND,
      );
    }
    aerolinea.aeropuertos = aerolinea.aeropuertos.filter(
      (aeropuerto) => aeropuerto.id !== idAeropuerto,
    );
    await this.aerolineaRepository.save(aerolinea);
  }
}
