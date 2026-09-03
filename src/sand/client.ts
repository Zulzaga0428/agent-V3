/**
 * Thin client for SAND, the container that actually runs the user's project.
 *
 * Two rules encoded here:
 *  - 404 means the preview expired, which is normal — callers get `gone` and
 *    create a fresh one. Treating it as a hard error is the classic bug.
 *  - Nothing is thrown for an ordinary sandbox outcome. A failing command is a
 *    result the agent reads, not an exception that ends the run.
 */

export type Mode = "app" | "expo" | "static";

export type SandFile = { path: string; content: string };

export type CreateResult =
  | { ok: true; id: string; url: string; warm: boolean; ready: boolean; reason?: string }
  | { ok: false; kind: "capacity"; retryAfterSec: number }
  | { ok: false; kind: "error"; status: number; message: string };

export type WriteResult =
  | { ok: true; warnings?: string[] }
  | { ok: false; kind: "gone" }
  | { ok: false; kind: "error"; status: number; message: string };

export type DeletedPath = { path: string; deleted?: boolean; error?: string };

export type DeleteResult =
  | { ok: true; results: DeletedPath[] }
  | { ok: false; kind: "gone" }
  | { ok: false; kind: "error"; status: number; message: string };

export type ReadResult =
  | { ok: true; files: { path: string; content?: string; error?: string }[] }
  | { ok: false; kind: "gone" }
  | { ok: false; kind: "error"; status: number; message: string };

export type ExecResult =
  | { ok: true; exitCode: number; stdout: string; stderr: string; timedOut: boolean }
  | { ok: false; kind: "gone" }
  | { ok: false; kind: "error"; status: number; message: string };

export type LogsResult =
  | { ok: true; stdout: string; stderr: string; truncated: boolean }
  | { ok: false; kind: "gone" }
  | { ok: false; kind: "error"; status: number; message: string };

export type SandOptions = {
  url?: string;
  key?: string;
  /** Create waits for the page to serve 200; SAND's own wait is 90s. */
  createTimeoutMs?: number;
  requestTimeoutMs?: number;
  /** Retries for connection-level failures only. */
  retries?: number;
};

export class SandClient {
  #url: string;
  #key: string;
  #createTimeoutMs: number;
  #requestTimeoutMs: number;
  #retries: number;

  constructor(opts: SandOptions = {}) {
    this.#url = (opts.url ?? process.env.SAND_URL ?? "").replace(/\/$/, "");
    this.#key = opts.key ?? process.env.SAND_KEY ?? "";
    this.#createTimeoutMs = opts.createTimeoutMs ?? 100_000;
    this.#requestTimeoutMs = opts.requestTimeoutMs ?? 60_000;
    this.#retries = opts.retries ?? 2;
    if (!this.#url) throw new Error("SAND_URL is not set");
    if (!this.#key) throw new Error("SAND_KEY is not set");
  }

  async createPreview(
    files: SandFile[],
    mode: Mode = "app",
    ttlMin = 15,
    signal?: AbortSignal,
  ): Promise<CreateResult> {
    const res = await this.#send("POST", "/api/previews", { files, mode, ttlMin }, this.#createTimeoutMs, signal);

    if (res.status === 503) {
      const retry = Number(res.headers?.get("Retry-After") ?? 30);
      return { ok: false, kind: "capacity", retryAfterSec: Number.isFinite(retry) ? retry : 30 };
    }
    if (res.status !== 200 || !res.body) {
      return { ok: false, kind: "error", status: res.status, message: res.text };
    }

    const b = res.body as Record<string, unknown>;
    return {
      ok: true,
      id: String(b.id),
      url: String(b.url),
      warm: Boolean(b.warm),
      ready: b.ready !== false,
      ...(typeof b.reason === "string" ? { reason: b.reason } : {}),
    };
  }

  async writeFiles(id: string, files: SandFile[], signal?: AbortSignal): Promise<WriteResult> {
    const res = await this.#send("PUT", `/api/previews/${previewSegment(id)}/files`, { files }, undefined, signal);
    if (res.status === 404) return { ok: false, kind: "gone" };
    if (res.status !== 200) {
      return { ok: false, kind: "error", status: res.status, message: res.text };
    }
    // The sandbox reports writes that would break the environment it provides:
    // a next.config that drops the host allowance and kills hot reload, a
    // tsconfig that unhooks the @/* paths. It is the only side that sees both
    // the incoming file and what it replaces, and none of it raises an error —
    // the write succeeds and the damage appears later as a preview that has
    // quietly stopped updating.
    const warnings = (res.body as { warnings?: unknown })?.warnings;
    return {
      ok: true,
      ...(Array.isArray(warnings) && warnings.length
        ? { warnings: warnings.map(String) }
        : {}),
    };
  }

  /**
   * Removes files or directories.
   *
   * A first-class endpoint rather than `rm` through `exec`: the sandbox
   * validates the paths, answers per path the way a read does, and is
   * idempotent — a path that is already gone is not an error, which is what
   * you want from a cleanup step that may run twice.
   */
  async deleteFiles(id: string, paths: string[], signal?: AbortSignal): Promise<DeleteResult> {
    const res = await this.#send("DELETE", `/api/previews/${previewSegment(id)}/files`, { paths }, undefined, signal);
    if (res.status === 404) return { ok: false, kind: "gone" };
    if (res.status !== 200 || !res.body) {
      return { ok: false, kind: "error", status: res.status, message: res.text };
    }
    const results = (res.body as { results?: unknown }).results;
    return { ok: true, results: Array.isArray(results) ? (results as DeletedPath[]) : [] };
  }

  async readFiles(id: string, paths: string[], signal?: AbortSignal): Promise<ReadResult> {
    const res = await this.#send("POST", `/api/previews/${previewSegment(id)}/read`, { paths }, undefined, signal);
    if (res.status === 404) return { ok: false, kind: "gone" };
    if (res.status !== 200 || !res.body) {
      return { ok: false, kind: "error", status: res.status, message: res.text };
    }
    const files = (res.body as { files?: unknown }).files;
    return { ok: true, files: Array.isArray(files) ? files : [] };
  }

  async exec(id: string, command: string, timeoutSec?: number, signal?: AbortSignal): Promise<ExecResult> {
    const timeout = Math.max(1, Math.min(300, timeoutSec ?? 60));
    const body: Record<string, unknown> = { command };
    if (timeoutSec !== undefined) body.timeoutSec = timeout;

    // Outlast the sandbox's own timeout so we report its result, not ours.
    const wait = timeout * 1000 + 15_000;
    const res = await this.#send("POST", `/api/previews/${previewSegment(id)}/exec`, body, wait, signal);

    if (res.status === 404) return { ok: false, kind: "gone" };
    if (res.status !== 200 || !res.body) {
      return { ok: false, kind: "error", status: res.status, message: res.text };
    }
    const b = res.body as Record<string, unknown>;
    return {
      ok: true,
      exitCode: Number(b.exitCode ?? 0),
      stdout: String(b.stdout ?? ""),
      stderr: String(b.stderr ?? ""),
      timedOut: Boolean(b.timedOut),
    };
  }

  async logs(id: string, tail = 200, signal?: AbortSignal): Promise<LogsResult> {
    const boundedTail = Math.max(1, Math.min(1_000, tail));
    const res = await this.#send("GET", `/api/previews/${previewSegment(id)}/logs?tail=${boundedTail}`, undefined, undefined, signal);
    if (res.status === 404) return { ok: false, kind: "gone" };
    if (res.status !== 200 || !res.body) {
      return { ok: false, kind: "error", status: res.status, message: res.text };
    }
    const b = res.body as Record<string, unknown>;
    return {
      ok: true,
      stdout: String(b.stdout ?? ""),
      stderr: String(b.stderr ?? ""),
      truncated: Boolean(b.truncated),
    };
  }

  async keepAlive(id: string): Promise<boolean> {
    const res = await this.#send("POST", `/api/previews/${previewSegment(id)}/keepalive`, {});
    return res.status === 200;
  }

  async stopPreview(id: string): Promise<void> {
    await this.#send("DELETE", `/api/previews/${previewSegment(id)}`);
  }

  // -------------------------------------------------------------- internals

  /**
   * Retries connection-level failures.
   *
   * DNS hiccups and dropped connections are routine on consumer networks, and
   * without this a blip is indistinguishable from the sandbox rejecting the
   * work — which then shows up in an eval report as the agent failing. The
   * measurement has to be about the agent, so transport noise is absorbed here.
   *
   * Only status 0 is retried: an HTTP response, including 500, means the server
   * received and decided, and repeating it could duplicate the effect. A failed
   * create may still leave an orphan container if the response was lost rather
   * than the request; the TTL reaps those.
   */
  async #send(
    method: string,
    path: string,
    body?: unknown,
    timeoutMs = this.#requestTimeoutMs,
    signal?: AbortSignal,
  ): Promise<{ status: number; body: unknown; text: string; headers?: Headers }> {
    let last = { status: 0, body: undefined as unknown, text: "" };

    for (let attempt = 0; attempt <= this.#retries; attempt++) {
      if (attempt > 0) {
        try {
          await sleep(400 * 2 ** (attempt - 1), signal);
        } catch {
          return { status: 0, body: undefined, text: "network: aborted" };
        }
      }
      if (signal?.aborted) return { status: 0, body: undefined, text: "network: aborted" };

      try {
        const res = await fetch(this.#url + path, {
          method,
          headers: {
            Authorization: `Bearer ${this.#key}`,
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          },
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: signal
            ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])
            : AbortSignal.timeout(timeoutMs),
        });

        const text = await res.text();
        let parsed: unknown;
        try {
          parsed = text ? JSON.parse(text) : undefined;
        } catch {
          parsed = undefined;
        }
        return { status: res.status, body: parsed, text, headers: res.headers };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        last = {
          status: 0,
          body: undefined,
          text: `network: ${message}${attempt ? ` (after ${attempt + 1} attempts)` : ""}`,
        };
      }
    }

    return last;
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(new Error("aborted"));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new Error("aborted"));
    }, { once: true });
  });
}

/**
 * A preview id is caller data, and it lands in a URL path sent with the SAND
 * key. Unencoded, a value carrying `/`, `..` or `?` reshapes the request into
 * a different endpoint than the one the method name promises — and nothing
 * about that failure looks like bad input. The server rejects malformed ids at
 * the boundary; this is the second layer, so a new call site cannot lose it.
 */
function previewSegment(id: string): string {
  return encodeURIComponent(id);
}
