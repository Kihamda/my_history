import { Hono } from "hono";
import type { AppBindings } from "../types/bindings";
import type { AppVariables } from "../middleware/auth";
import {
  getGinoshoDetail,
  getGinoshoMasterList,
  getGradeMaster,
  getGradeMasterList,
} from "../repositories/mastersRepository";

const mastersRouter = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

mastersRouter.get("/ginosho", async (c) => {
  const list = await getGinoshoMasterList(c.env);
  return c.json({ items: list });
});

mastersRouter.get("/ginosho/:id", async (c) => {
  const id = c.req.param("id");
  const detail = await getGinoshoDetail(c.env, id);

  if (!detail) {
    return c.json(
      {
        error: "GINOSHO_NOT_FOUND",
      },
      404
    );
  }

  return c.json(detail);
});

mastersRouter.get("/grade", async (c) => {
  const list = await getGradeMasterList(c.env);
  return c.json({ items: list });
});

mastersRouter.get("/grade/:id", async (c) => {
  const id = c.req.param("id");
  const detail = await getGradeMaster(c.env, id);

  if (!detail) {
    return c.json(
      {
        error: "GRADE_NOT_FOUND",
      },
      404
    );
  }

  return c.json(detail);
});

export default mastersRouter;
