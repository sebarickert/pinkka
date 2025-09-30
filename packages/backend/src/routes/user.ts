import { Hono } from "hono";

export const user = new Hono();

user.get("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id, name: "John Doe" });
});
