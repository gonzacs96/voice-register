import { VoiceRegisterException } from './voiceRegister.exception';

export class NotFoundException extends VoiceRegisterException {
  constructor(message?: string | Record<string, any>) {
    super({ statusCode: 404, message: message ?? 'Not Found' }, 404);
  }
}
