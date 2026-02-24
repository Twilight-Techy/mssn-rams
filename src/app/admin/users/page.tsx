import { getUsers } from "@/app/actions/userActions";
import UsersManager from "./UsersManager";
import { getUserProfile } from "@/app/actions/getUser";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
    const currentUser = await getUserProfile();

    // Extra guard: Only super_admin can see this page
    if (!currentUser || currentUser.role !== "super_admin") {
        redirect("/admin");
    }

    const users = await getUsers();

    return <UsersManager initialUsers={users} />;
}
