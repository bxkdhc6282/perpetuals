import { Connection } from "@solana/web3.js";

export function createConnectionProxy(endpoints: string[]): Connection {
  return new Proxy(new Connection(endpoints[0], { commitment: "confirmed" }), {
    get(target, prop, receiver) {
      if (typeof target[prop as keyof Connection] !== "function") {
        return Reflect.get(target, prop, receiver);
      }

      return async (...args: any[]) => {
        let lastError: any;
        for (const endpoint of endpoints) {
          const conn = new Connection(endpoint, { commitment: "confirmed" });
          try {
            const fn = conn[prop as keyof Connection] as Function;
            return await fn.apply(conn, args);
          } catch (error) {
            lastError = error;
            console.warn(
              `Method ${String(prop)} failed on ${endpoint}:`,
              error instanceof Error ? error.message : "Failed Connection"
            );
          }
        }

        throw new Error(
          `All RPC attempts for method ${String(prop)} failed: ${
            lastError?.message
          }`
        );
      };
    },
  });
}
