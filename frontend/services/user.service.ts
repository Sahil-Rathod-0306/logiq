import api from "./api";
import type { User } from "@/types";
export async function getUsers(): Promise<User[]> { const response = await api.get("/admin/users"); return response.data.data.map((item: { _id: string; name: string; email: string; role: User["role"] }) => ({ id: item._id, name: item.name, email: item.email, role: item.role, status: "ACTIVE" })); }
