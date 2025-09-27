import { Hono } from "hono";
import { requireAuth, type AppVariables } from "../middleware/auth";
import type { AppBindings } from "../types/bindings";

const authRouter = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>()

.post("/login", async (c) => {
    // ログイン処理、JWTトークンの発行
    firestor
