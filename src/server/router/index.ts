// src/server/router/index.ts
import superjson from "superjson";
import { createRouter } from "./context";

import { authorRouter } from "./author-router";
import { bookRouter } from "./book-router";
import { cronRouter } from "./cron-router";
import { userRouter } from "./user-router";

export const appRouter = createRouter()
    .transformer(superjson)
    .merge("book-", bookRouter)
    .merge("user-", userRouter)
    .merge("author-", authorRouter)
    .merge("cron-", cronRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
