import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AeropuertoDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @Length(3)
  @IsNotEmpty()
  readonly codigo: string;

  @IsString()
  @IsNotEmpty()
  readonly pais: string;

  @IsString()
  @IsNotEmpty()
  readonly ciudad: string;
}
