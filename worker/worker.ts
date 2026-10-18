export interface Env { VULNROOM_DO: DurableObjectNamespace; }
export class VulnRoomDO {
  private state: DurableObjectState;
  private vulns: Map<string, any> = new Map();
  private websockets: WebSocket[] = [];
  constructor(state: DurableObjectState, env: Env) { this.state = state; }
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    if (url.pathname === '/vulns' && request.method === 'GET') {
      return Response.json(Array.from(this.vulns.values()));
    }
    if (url.pathname === '/vuln' && request.method === 'POST') {
      const data = await request.json();
      this.vulns.set(data.id, { ...data, fixed: false });
      this.broadcast(JSON.stringify({ type: 'vuln', data: this.vulns.get(data.id) }));
      return Response.json({ success: true });
    }
    return new Response('Not Found', { status: 404 });
  }
  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) { }
  webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) { this.websockets = this.websockets.filter(w => w !== ws); }
  private broadcast(msg: string) { for (const ws of this.websockets) { if (ws.readyState === 1) ws.send(msg); } }
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const id = env.VULNROOM_DO.idFromName(url.pathname);
    const stub = env.VULNROOM_DO.get(id);
    return stub.fetch(request);
  }
}