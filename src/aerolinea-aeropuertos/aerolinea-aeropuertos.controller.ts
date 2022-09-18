import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { AerolineaAeropuertoService } from './aerolinea-aeropuertos.service';

@Controller('airlines')
@UseInterceptors(BusinessErrorsInterceptor)
export class AerolineaAeropuertoController {
  constructor(
    private readonly aerolineaAeropuertoService: AerolineaAeropuertoService,
  ) {}

  @Post(':aerolineaId/airports/:aeropuertoId')
  async addAirportToAirline(
    @Param('aerolineaId') aerolineaId: string,
    @Param('aeropuertoId') aeropuertoId: string,
  ) {
    return await this.aerolineaAeropuertoService.addAirportToAirline(
      aerolineaId,
      aeropuertoId,
    );
  }

  @Get(':aerolineaId/airports/:aeropuertoId')
  async findAirportFromAirline(
    @Param('aerolineaId') aerolineaId: string,
    @Param('aeropuertoId') aeropuertoId: string,
  ) {
    return await this.aerolineaAeropuertoService.findAirportFromAirline(
      aerolineaId,
      aeropuertoId,
    );
  }

  @Get(':aerolineaId/airports')
  async findAirportsFromAirline(@Param('aerolineaId') aerolineaId: string) {
    return await this.aerolineaAeropuertoService.findAirportsFromAirline(
      aerolineaId,
    );
  }

  @Put(':aerolineaId/airports')
  async updateAirportsFromAirline(
    @Body() aeropuertosDto: AeropuertoEntity[],
    @Param('aerolineaId') aerolineaId: string,
  ) {
    const aeropuertos = plainToInstance(AeropuertoEntity, aeropuertosDto);
    return await this.aerolineaAeropuertoService.updateAirportsFromAirline(
      aerolineaId,
      aeropuertos,
    );
  }

  @Delete(':aerolineaId/airports/:aeropuertoId')
  @HttpCode(204)
  async deleteAirportFromAirline(
    @Param('aerolineaId') aerolineaId: string,
    @Param('aeropuertoId') aeropuertoId: string,
  ) {
    return await this.aerolineaAeropuertoService.deleteAirportFromAirline(
      aerolineaId,
      aeropuertoId,
    );
  }
}
