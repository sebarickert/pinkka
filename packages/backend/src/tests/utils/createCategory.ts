import type { UserWithSessionToken } from "@/tests/utils/createTestUser.js";
import { fetcher } from "@/tests/utils/fetcher.js";
import type { Category } from "@/types/Category.js";
import type { NewCategoryDto } from "@pinkka/schemas/CategoryDto.js";

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

  return body.data;
}
