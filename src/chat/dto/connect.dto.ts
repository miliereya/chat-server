import { IsString } from "class-validator";

export class ConnectDto {
    @IsString()
    userId: string
}