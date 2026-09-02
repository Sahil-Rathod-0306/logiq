import api from "./api";
export interface Notification { id: string; type: string; channel: string; subject: string; message: string; status: string; createdAt: string; incidentId: string }
export async function getNotifications() { const response = await api.get("/notifications", { params: { limit: 100 } }); return { notifications: (response.data.data as Array<Record<string, string>>).map(item => ({ id: item._id!, type: item.type!, channel: item.channel!, subject: item.subject!, message: item.message!, status: item.status!, createdAt: item.createdAt!, incidentId: item.incidentId! })), total: response.data.total as number }; }
export async function retryNotification(id: string) { await api.post(`/notifications/${id}/retry`); }
