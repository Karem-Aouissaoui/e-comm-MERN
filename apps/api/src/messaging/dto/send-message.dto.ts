import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * SendMessageDto:
 * The only thing the client needs to send to post a message is the text body.
 */
export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body!: string;
}
