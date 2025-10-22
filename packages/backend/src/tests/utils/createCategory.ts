import type { UserWithSessionToken } from "@/tests/utils/createTestUser.js";
import { fetcher } from "@/tests/utils/fetcher.js";
import type { Category } from "@/types/db/Category.js";
import type { NewCategoryDto } from "@pinkka/schemas/CategoryDto.js";
import { expect } from "vitest";

export async function createCategory(
  newCategoryPayload: Omit<NewCategoryDto, "is_deleted">,
  user: UserWithSessionToken
): Promise<Category> {
  const res = await fetcher(
    "/api/categories",
    {
      method: "POST",
      body: JSON.stringify(newCategoryPayload),
    },
    user.session_token
  );

  const body = await res.json();

  expect(res.status).toEqual(201);
  expect(body.status).toEqual("success");

  return body.data;
}
