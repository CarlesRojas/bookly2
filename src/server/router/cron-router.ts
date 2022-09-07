import { createRouter } from "./context";

export const cronRouter = createRouter().query("get-all", {
    async resolve() {
        console.log("hola");

        return { success: true };
    },
});
