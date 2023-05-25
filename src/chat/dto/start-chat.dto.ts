import { IsString } from "class-validator";

export class StartChatDto {
    @IsString()
    fromUserId: string

    @IsString()
    toUserId: string
}
