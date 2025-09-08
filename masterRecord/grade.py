from setting import path


def help():
    print("Available commands:")
    print(
        "list <id?> - 登録されている進級章をすべて表示します。第二引数にIDを指定すると、そのIDと後方一致する技能章のみを表示します。"
    )
    print("detail list <id> - 細目ファイルの管理コマンド")
    print("help - このヘルプメッセージを表示します")
    print(
        "addコマンドなどは実装されていません(never)。数が少ないのでcsvを手動で触ってください。"
    )


def load():
    db = []
    with open(path + "/data/grade.csv", "r", encoding="utf-8") as file:
        data = [s.rstrip() for s in file.readlines()]
        for line in data:
            parts = line.split(",")
            db.append(
                {
                    "id": parts[0],
                    "name": parts[1],
                    "unit": parts[2],
                    "detailIndex": parts[3].split("/"),
                }
            )
    return db


def load_detail(id):
    db = []
    with open(path + f"/data/gradeDetail/{id}.csv", "r", encoding="utf-8") as file:
        data = [s.rstrip() for s in file.readlines()]
        for line in data:
            parts = line.split(",")
            db.append(
                {
                    "id": parts[0],
                    "number": parts[1],
                    "description": parts[2],
                    "cert": parts[3],
                }
            )
        return db


def list(filter=None):
    db = load()
    for record in db:
        if filter is None or filter in record["name"]:
            print(record)


def detail_list(id):
    db = load_detail(id)
    for parts in db:
        print(
            f"内部番号: {parts['id']}, みかけの番号: {parts['number']}, 説明: {parts['description']}, 隊長認定: {parts['cert']}"
        )


def grade():
    while True:
        command = input("(進級章)Enter command: ").split(" ")
        if command[0] == "exit":
            break
        elif command[0] == "list":
            if len(command) > 1:
                list(command[1])
            else:
                list()
        elif command[0] == "edit" or command[0] == "add":
            pass
        elif command[0] == "detail":
            if len(command) > 1:
                if command[1] == "list":
                    if len(command) > 2:
                        detail_list(command[2])
                    else:
                        print("Usage: detail list <技能章ID>")
                else:
                    print("Unknown detail command.")
            else:
                print("Usage: detail <command>")
        elif command[0] == "help":
            help()
        else:
            print("Unknown command.")
