from setting import path
from gino import load as ginoLoad
from ginoDetail import load as ginoDetailLoad
from grade import load as gradeLoad, load_detail as gradeDetailLoad
import os, json, shutil


def build():
    os.makedirs(path + "dist", exist_ok=True)
    os.makedirs(path + "dist/grade", exist_ok=True)
    os.makedirs(path + "dist/ginosho", exist_ok=True)

    db = gradeLoad()
    gradesList = []
    for record in db:
        detail = gradeDetailLoad(record["id"])
        det = []
        for d in detail:
            det.append(
                {
                    "id": d["id"],
                    "number": d["number"],
                    "description": d["description"],
                    "cert": d["cert"],
                }
            )
        data = {
            "id": record["id"],
            "name": record["name"],
            "detailIndex": record["detailIndex"],
            "detail": det,
        }
        json.dump(
            data,
            open(path + f"dist/grade/{record['id']}.json", "w", encoding="utf-8"),
            ensure_ascii=False,
            indent=4,
        )
        gradesList.append({"id": record["id"], "name": record["name"]})
    json.dump(
        gradesList,
        open(path + "dist/grade.json", "w", encoding="utf-8"),
        ensure_ascii=False,
        indent=4,
    )

    # 技能章をbuild
    db = ginoLoad()
    ginoshoList = []
    for record in db:
        detail = ginoDetailLoad(record["id"])
        det = []
        for d in detail:
            det.append(
                {"id": d["id"], "number": d["number"], "description": d["description"]}
            )
        data = {
            "id": record["id"],
            "name": record["name"],
            "cert": record["cert"],
            "url": record["url"],
            "detail": det,
        }
        json.dump(
            data,
            open(path + f"dist/ginosho/{record['id']}.json", "w", encoding="utf-8"),
            ensure_ascii=False,
            indent=4,
        )
        ginoshoList.append(
            {
                "id": record["id"],
                "name": record["name"],
                "cert": record["cert"],
                "url": record["url"],
            }
        )
    json.dump(
        ginoshoList,
        open(path + "dist/ginosho.json", "w", encoding="utf-8"),
        ensure_ascii=False,
        indent=4,
    )

    # publicに複製
    os.makedirs(path + "/../public/data", exist_ok=True)
    shutil.copytree(
        path + "dist",
        path + "/../public/data",
        dirs_exist_ok=True,
    )


if __name__ == "__main__":
    build()
