import prisma from "../../config/prisma";
import { CreateCategoryDto } from "./category.types";

export const createCategoryRepo = (data: CreateCategoryDto) => {
  return prisma.category.create({ data: { name: data.name.trim() } });
};

export const getCategoriesRepo = () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};
