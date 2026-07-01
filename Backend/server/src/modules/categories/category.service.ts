import { createCategoryRepo, getCategoriesRepo } from "./category.repository";
import { CreateCategoryDto } from "./category.types";

export const createCategoryService = (data: CreateCategoryDto) => createCategoryRepo(data);
export const getCategoriesService = () => getCategoriesRepo();
