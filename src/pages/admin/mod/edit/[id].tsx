import Main from "@components/main";
import MetaInfo from "@components/meta";
import NoAccess from "@components/errors/noaccess";
import { getServerAuthSession } from "@server/common/get-server-auth-session";
import { Has_Perm } from "@utils/permissions";
import { type GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { type CategoryWithChildren } from "~/types/category";

import { prisma } from "@server/db/client";
import { type Source } from "@prisma/client";
import ModForm from "@components/forms/mod/main";
import { type ModWithRelations } from "~/types/mod";
import NotFound from "@components/errors/notfound";

export default function Page ({
    mod,
    categories,
    sources
} : {
    mod?: ModWithRelations
    categories: CategoryWithChildren[]
    sources: Source[]
}) {
    const { data: session } = useSession();

    return (
        <>
            <MetaInfo
                title={`Editing Mod ${mod?.name ?? "N/A"}  - Best Mods`}
            />
            <Main>
                <div className="flex flex-col gap-2">
                    {Has_Perm(session, "admin") ? (
                        <>
                            {mod ? (
                                <>
                                    <h1>Editing Mod {mod.name}</h1>
                                    <ModForm
                                        mod={mod}
                                        categories={categories}
                                        sources={sources}
                                    />
                                </>
                            ) : (
                                <NotFound item="mod" />
                            )}
                        </>
                    ) : (
                        <NoAccess />
                    )}
                </div>
            </Main>
        </>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { params } = ctx;

    const id = params?.id?.toString();

    let mod: ModWithRelations | null = null;
    let categories: CategoryWithChildren[] = [];
    let sources: Source[] = [];

    const session = await getServerAuthSession(ctx);

    if (Has_Perm(session, "admin") && id) {
        mod = await prisma.mod.findFirst({
            include: {
                category: true,
                ModDownload: true,
                ModScreenshot: true,
                ModSource: true,
                ModInstaller: true,
                ModCredit: true
            },
            where: {
                id: Number(id)
            }
        });

        categories = await prisma.category.findMany({
            include: {
                children: true
            },
            where: {
                parent: null
            }
        });

        sources = await prisma.source.findMany();
    }

    return {
        props: {
            mod: JSON.parse(JSON.stringify(mod, (_, v) => typeof v === "bigint" ? v.toString() : v)),
            categories: categories,
            sources: sources
        }
    }
}