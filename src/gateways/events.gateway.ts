import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Namespace, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'vozregistersocket',
})
export class EventsVozRegisterGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsVozRegisterGateway.name);

  @WebSocketServer() io: Namespace;

  handleDisconnect(client: Socket) {
    const sockets = this.io.sockets;
    this.logger.log(`WS client whit id: ${client.id} disconnected`);
    this.logger.debug(`Number of connected sockets : ${sockets.size}`);
  }
  handleConnection(client: Socket) {
    const sockets = this.io.sockets;
    this.logger.log(`WS client whit id: ${client.id} connected`);
    this.logger.debug(`Number of connected sockets : ${sockets.size}`);
  }

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    this.logger.debug(data);
    return from([1, 2, 3]).pipe(map((item) => ({ event: 'events', data: item })));
  }

  @SubscribeMessage('identity')
  identity(@MessageBody() data: number): WsResponse<number> {
    this.logger.debug(data);
    return { event: 'identity', data };
  }
}
