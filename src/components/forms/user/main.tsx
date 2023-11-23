import { useContext, useMemo, useState } from "react";
import { trpc } from "../../../utils/trpc";
import { Field, Form, Formik } from "formik";

import { type Permissions, type User } from "@prisma/client";

import { AlertForm } from "@utils/alert";

import Link from "next/link";
import ScrollToTop from "@utils/scroll";
import { GetContents } from "@utils/file";
import { ErrorCtx, SuccessCtx } from "@pages/_app";

export default function UserForm ({
    user
} : {
    user: User | null
}) {
    const errorCtx = useContext(ErrorCtx);
    const successCtx = useContext(SuccessCtx);

    // Mutations.
    const mut = trpc.user.update.useMutation({
        onError: (opts) => {
            const { message } = opts;

            console.error(message);

            if (errorCtx) {
                errorCtx.setTitle(`Error ${user ? "Saving" : "Adding"} User`);
                errorCtx.setMsg(`There was an error when attempting to ${user ? "save" : "add"} user. Please check the console for more details.`);
            }
        },
        onSuccess: () => {
            if (successCtx) {
                successCtx.setTitle(`Successfully ${user ? "Saved" : "Added"} User!`);
                successCtx.setMsg(`Successfully ${user ? "saved" : "added"} user!`);
            }
        }
    });

    // Avatar data.
    const [avatar, setAvatar] = useState<string | ArrayBuffer | null>(null);
        
    return (
        <Formik
            initialValues={{
                name: user?.name ?? "",
                email: user?.email ?? "",
                aremove: false
            }}
            onSubmit={(values) => {
                if (user) {
                    mut.mutate({
                        ...values,
                        id: user.id,
                        avatar: avatar?.toString()
                    });
    
                    // Scroll to top.
                    ScrollToTop();
                }
            }}
        >
            {() => (
                <Form>
                    <div>
                        <h2>General Information</h2>
                        <div className="form-container">
                            <label
                                htmlFor="avatar" 
                                className="form-label"
                            >Avatar</label>
                            <input
                                type="file"
                                className="form-input"
                                name="avatar"
                                placeholder="Avatar" 
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];

                                    if (file) {
                                        const contents = await GetContents(file);

                                        setAvatar(contents);
                                    }
                                }}
                            />
                            <Field
                                type="checkbox"
                                className="form-checkbox"
                                name="iremove"
                            />
                            <label
                                htmlFor="iremove" 
                                className="form-checkbox-label"
                            >Remove Current</label>
                        </div>
                        <div className="form-container">
                            <label
                                htmlFor="name"
                                className="form-label"
                            >Name</label>
                            <Field
                                type="text"
                                className="form-input"
                                name="name"
                                placeholder="User's name"
                            />
                        </div>
                        <div className="form-container">
                            <label
                                htmlFor="email"
                                className="form-label"
                            >Email</label>
                            <Field
                                type="text"
                                className="form-input"
                                name="email"
                                placeholder="User's email"
                            />
                        </div>
                        <Permissions user={user} />
                    </div>
                    <div className="text-center">
                        <button 
                            type="submit"
                            className="btn btn-success"
                        >{!user ? "Add User!" : "Edit User!"}</button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}

const Permissions: React.FC<{
    user: User | null
}> = ({
    user
}) => {    
    // Queries. We're using a query so we can keep our permission list update to date without reloading our page.
    const perm_list_query = trpc.permission.retrieveUserPerms.useQuery({
        id: user?.id ?? ""
    });
    const permissions = perm_list_query.data;

    // Mutations.
    const perm_add_mut = trpc.permission.addUserPerm.useMutation();
    const perm_del_mut = trpc.permission.delUserPerm.useMutation();

    let error: string | undefined = undefined;
    let success: string | undefined = undefined;

    // To Do: Figure out how to make sure one of the mutations are false at all times.
    if (perm_add_mut.isSuccess) {
        success = "Successfully added permission!";
        error = undefined;
    } else if (perm_add_mut.isError) {
        error = perm_add_mut.error.message;
        success = undefined;
    }
    
    if (perm_del_mut.isSuccess) {
        success = "Successfully removed permission!";
        error = undefined;
    } else if (perm_del_mut.isError) {
        error = perm_del_mut.error.message;
        success = undefined;
    }

    const permissions_list = useMemo(() => {
        // Refetch items.
        perm_list_query.refetch();

        return (
            <>
                {permissions?.map((permission: Permissions) => {
                    if (!permission)
                        return;

                    return (
                        <Link 
                            key={"user-permission-" + permission.perm} href="/"
                            onClick={(e) => {
                                e.preventDefault();
                                
                                perm_del_mut.mutate({
                                    id: permission.userId,
                                    perm: permission.perm
                                });
                            }}
                        >{permission.perm}</Link>
                    );
                })}
            </>
        );
    }, [perm_del_mut, perm_list_query, permissions]);

    return (
        <>
            <h2>Permissions</h2>
            <AlertForm
                error={error}
                success={success}
            />
            <div className="form-container">
                <div className="user-edit-permissions-items">
                    {permissions_list}
                </div>
                <div className="form-container user-edit-permissions-container">
                    <label>Permission</label>
                    <input 
                        type="text"
                        className="form-input"
                        id="permission"
                    />
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();

                            if (user) {
                                const perm = (document.getElementById("permission") as HTMLInputElement).value;

                                perm_add_mut.mutate({
                                    id: user.id,
                                    perm: perm
                                });
                            }
                        }}
                    >Add!</button>
                </div>
            </div>
        </>
    )
}