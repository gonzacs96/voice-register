import { VoiceRegisterException } from './voiceRegister.exception';

export class InvalidArgumentException extends VoiceRegisterException {
  constructor(message?: string | Record<string, any>) {
    super({ statusCode: 400, message: message ?? 'Bad request' }, 400);
  }
}
