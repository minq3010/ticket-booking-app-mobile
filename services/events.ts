import { EventResponse, EventListResponse } from "@/types/event";
import { Api } from "./api";

async function createOne(name: string, location: string, price: number, date: string, description?: string): Promise<EventResponse> {
  return Api.post("/event", { name, location, price, date, description });
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

async function updateOne(id: number, name: string, location: string, price: number, date: string, description?: string): Promise<EventResponse> {
  return Api.put(`/event/${id}`, { name, location, price, date, description });
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
  updateOne,
  updateOneWithImage,
  deleteOne,
};

export { eventService };