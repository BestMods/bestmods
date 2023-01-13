import { z } from "zod";
import { router, publicProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"

export const ratingRouter = router({
    getRatingsForMod: publicProcedure
        .input(z.object({
            url: z.string(),
            dateStart: z.date().nullable(),
            dateEnd: z.date().nullable()
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.modRating.findMany({
                where: {
                    ...(input.dateStart != null && { 
                        createdAt: {
                            gte: input.dateStart
                        }
                    }),
                    ...(input.dateEnd != null && {
                        createdAt: {
                            lte: input.dateEnd
                        }
                    })
                }
            })
        })
});