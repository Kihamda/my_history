import { Hono } from "hono";
import { AppContext } from "../apiRotuer";
import searchScouts from "./search";
import createScout from "./create";

const scoutRouter = new Hono<AppContext>()

  // Scout 一覧を検索する
  .get("/search", searchScouts)

  // Scout 作成
  .post("/create", createScout);

export default scoutRouter;
