import {
  createShopRepo,
  getShopByIdRepo,
  getShopsRepo,
  updateShopRepo,
  deleteShopRepo,
} from "./shop.repository";

import { CreateShopDto } from "./shop.types";

export const createShopService = async (data: CreateShopDto, userId: string) => {
  return createShopRepo(data, userId);
};

export const getShopByIdService = async (id: string) => {
  return getShopByIdRepo(id);
};

export const getShopsService = async (
  page: number,
  limit: number,
  search: string
) => {
  return getShopsRepo(page, limit, search);
};

export const updateShopService = async (id: string, data: any) => {
  return updateShopRepo(id, data);
};

export const deleteShopService = async (id: string) => {
  return deleteShopRepo(id);
};