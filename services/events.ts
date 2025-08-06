import { EventResponse, EventListResponse } from "@/types/event";
import { Api } from "./api";

async function createOne(name: string, location: string, price: number, maxTickets: number, date: string, description?: string): Promise<EventResponse> {
  return Api.post("/event", { name, location, price, maxTickets, date, description });
}

async function createOneWithImage(formData: FormData): Promise<EventResponse> {
  return Api.post("/event", formData);
}

async function getOne(id: number): Promise<EventResponse> {
  return Api.get(`/event/${id}`);
}

async function getAll(): Promise<EventListResponse> {
  return Api.get("/event");
}

async function searchByName(name: string): Promise<EventListResponse> {
  return Api.get(`/event?name=${encodeURIComponent(name)}`);
}

async function updateOne(id: number, name: string, location: string, price: number, maxTickets: number, date: string, description?: string): Promise<EventResponse> {
  return Api.put(`/event/${id}`, { name, location, price, maxTickets, date, description });
}

async function updateOneWithImage(id: number, formData: FormData): Promise<EventResponse> {
  return Api.put(`/event/${id}`, formData);
}

async function deleteOne(id: number): Promise<EventResponse> {
  return Api.delete(`/event/${id}`);
}

const eventService = {
  createOne,
  createOneWithImage,
  getOne,
  getAll,
  searchByName,
  updateOne,
  updateOneWithImage,
  deleteOne,
};

export { eventService };