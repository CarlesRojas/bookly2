import getAllBooksAndAuthors from "@server/scrapper/getAllBooksAndAuthors";
import { createRouter } from "./context";

export const cronRouter = createRouter().query("get-all", {
    async resolve() {
        try {
            await getAllBooksAndAuthors();
        } catch (error) {
            return { success: false, error };
        }

        return { success: true };
    },
});
