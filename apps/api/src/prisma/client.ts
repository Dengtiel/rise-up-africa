// Use the generated Prisma client output so the runtime looks in the project's generated
// folder instead of expecting the client inside node_modules. The generator in
// `prisma/schema.prisma` outputs the client to `src/generated/prisma`.
//
// This import will work after `pnpm --filter ./apps/api run prisma:generate` has been
// executed (or `pnpm run prisma:generate` from `apps/api`).
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export default prisma;

