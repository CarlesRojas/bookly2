# Bookly 2

## Planetscale

Create a planetscale database called `main`, and create a branch from it called `shadow`.

Open two terminals and run these commands. One in each terminal.
`pscale connect bookly main --port 3309`
`pscale connect bookly shadow --port 3310`

## Prisma

Every time the model in `schema.prisma` changes, run:
`npx prisma migrate dev`

## Docs

-   [Next-Auth.js](https://next-auth.js.org)
-   [Prisma](https://prisma.io)
-   [tRPC](https://trpc.io) (using @next version? [see v10 docs here](https://alpha.trpc.io))

Also checkout these awesome tutorials on `create-t3-app`.

-   [Build a Blog With the T3 Stack - tRPC, TypeScript, Next.js, Prisma & Zod](https://www.youtube.com/watch?v=syEWlxVFUrY)
-   [Build a Live Chat Application with the T3 Stack - TypeScript, Tailwind, tRPC](https://www.youtube.com/watch?v=dXRRY37MPuk)
-   [Build a full stack app with create-t3-app](https://www.nexxel.dev/blog/ct3a-guestbook)
-   [A first look at create-t3-app](https://dev.to/ajcwebdev/a-first-look-at-create-t3-app-1i8f)
-   [Protecting routes with Next-Auth.js](https://next-auth.js.org/configuration/nextjs#unstable_getserversession)

## How do I deploy this?

### Vercel

We recommend deploying to [Vercel](https://vercel.com/?utm_source=t3-oss&utm_campaign=oss). It makes it super easy to deploy NextJs apps.

-   Push your code to a GitHub repository.
-   Go to [Vercel](https://vercel.com/?utm_source=t3-oss&utm_campaign=oss) and sign up with GitHub.
-   Create a Project and import the repository you pushed your code to.
-   Add your environment variables.
-   Click **Deploy**
-   Now whenever you push a change to your repository, Vercel will automatically redeploy your website!
