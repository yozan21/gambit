import { execSync } from "child_process";
import type { FastifyReply, FastifyRequest } from "fastify";

export const health = async (req: FastifyRequest, reply: FastifyReply) => {
  const mem = process.memoryUsage();

  let containerMem = "unknown";
  let stockfishProcs = 0;
  let stockfishRss = 0;

  try {
    // cgroup v1 or v2 memory
    const cgroupPath = "/sys/fs/cgroup/memory/memory.usage_in_bytes";
    const cgroupV2Path = "/sys/fs/cgroup/memory.current";
    const fs = await import("fs");

    let usageBytes = 0;
    if (fs.existsSync(cgroupV2Path)) {
      usageBytes = parseInt(fs.readFileSync(cgroupV2Path, "utf8"));
    } else if (fs.existsSync(cgroupPath)) {
      usageBytes = parseInt(fs.readFileSync(cgroupPath, "utf8"));
    }
    containerMem = `${Math.round(usageBytes / 1024 / 1024)} MB`;

    // Count stockfish processes
    const ps = execSync("ps -eo rss,comm | grep -i stockfish || true", {
      encoding: "utf8",
    });
    const lines = ps.trim().split("\n").filter(Boolean);
    stockfishProcs = lines.length;
    stockfishRss = lines.reduce((sum, line) => {
      const rss = parseInt(line.trim().split(/\s+/)[0] ?? "0");
      return sum + (isNaN(rss) ? 0 : rss);
    }, 0);
  } catch (e) {
    // ignore
  }

  return {
    nodeRss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
    nodeHeap: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
    nodeArrayBuffers: `${Math.round(mem.arrayBuffers / 1024 / 1024)} MB`,
    containerTotal: containerMem,
    stockfishProcesses: String(stockfishProcs),
    stockfishRssMB: `${Math.round(stockfishRss / 1024)} MB`,
  };
};
