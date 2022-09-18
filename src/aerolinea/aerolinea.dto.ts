import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsUrl, MaxDate } from 'class-validator';

export class AerolineaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MaxDate(new Date())
  @IsNotEmpty()
  foundationDate: Date;

  @IsUrl()
  @IsNotEmpty()
  webPage: string;
}
