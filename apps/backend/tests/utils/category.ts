import {
  type NewCategoryDto,
  type CategoryDto,
  type UpdateCategoryDto,
} from "@pinkka/schemas/category-dto.js";
import type { JsonResponse } from "@pinkka/schemas/json-response.js";
import type { UserWithSessionToken } from "@/test-utils/create-test-user.js";
import { fetcher } from "@/test-utils/fetcher.js";

export async function getCategories(
  user: UserWithSessionToken,
): Promise<{ status: number; body: JsonResponse<CategoryDto[]> }> {
  const response = await fetcher("/api/categories", {}, user.sessionToken);

  const body = (await response.json()) as JsonResponse<CategoryDto[]>;

  return { status: response.status, body };
}

export async function getCategory(
  id: string,
  user: UserWithSessionToken,
): Promise<{ status: number; body: JsonResponse<CategoryDto> }> {
  const response = await fetcher(
    `/api/categories/${id}`,
    {},
    user.sessionToken,
  );

  const body = (await response.json()) as JsonResponse<CategoryDto>;

  return { status: response.status, body };
}

export async function createCategory(
  newCategoryPayload: NewCategoryDto | undefined,
  user: UserWithSessionToken,
): Promise<{ status: number; body: JsonResponse; data: CategoryDto }> {
  const response = await fetcher(
    "/api/categories",
    {
      method: "POST",
      body: JSON.stringify(newCategoryPayload),
    },
    user.sessionToken,
  );

  const body = (await response.json()) as JsonResponse<CategoryDto>;

  return { status: response.status, body, data: body.data as CategoryDto };
}

export async function updateCategory(
  id: string,
  updateCategoryPayload: Partial<UpdateCategoryDto>,
  user: UserWithSessionToken,
): Promise<{ status: number; body: JsonResponse<CategoryDto> }> {
  const response = await fetcher(
    `/api/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(updateCategoryPayload),
    },
    user.sessionToken,
  );

  const body = (await response.json()) as JsonResponse<CategoryDto>;

  return { status: response.status, body };
}

export async function deleteCategory(
  id: string,
  user: UserWithSessionToken,
): Promise<{
  status: number;
  body: JsonResponse<CategoryDto>;
  data: CategoryDto;
}> {
  const response = await fetcher(
    `/api/categories/${id}`,
    {
      method: "DELETE",
    },
    user.sessionToken,
  );

  const body = (await response.json()) as JsonResponse<CategoryDto>;

  return { status: response.status, body, data: body.data as CategoryDto };
}
