import "socket.io"

declare module "socket.io" {
  interface Socket {
    user?: { id: string; name: string; roles: string[] }
  }
}
