import { Socket, Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export let socket: Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
> | null = null;

export const setSocket = (
  newSocket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket = newSocket;
};

export let io: Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
> | null = null;

export const setIO = (
  newIO: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  io = newIO;
};
