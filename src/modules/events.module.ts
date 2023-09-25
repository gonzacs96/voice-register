import { Module } from '@nestjs/common';
import { EventsVozRegisterGateway } from '../gateways/events.gateway';

@Module({
  providers: [EventsVozRegisterGateway],
})
export class EventsModule {}
