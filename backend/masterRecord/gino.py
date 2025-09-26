from setting import path
from ginoDetail import detail


def load():
    db = []
    with open(path + "data/ginosho.csv", "r", encoding="utf-8") as file:
        data = [s.rstrip() for s in file.readlines()]
        for line in data:
            parts = line.split(",")
            db.append(
                {"id": parts[0], "name": parts[1], "cert": parts[2], "url": parts[3]}
            )
    return db


def save(db):
    with open(path + "/data/ginosho.csv", "w", encoding="utf-8") as file:
        for record in db:
            file.write(
                f"{record['id']},{record['name']},{record['cert']},{record['url']}\n"
            )
        print("Record updated.")


def help():
    print("Available commands:")
    print(
        "list <id?> - 登録されている技能章をすべて表示します。第二引数にIDを指定すると、そのIDと後方一致する技能章のみを表示します。"
    )
    print(
        "add <id> <name> <cert> - 新しい技能章を追加します。<id>は技能章のID、<name>は技能章の名前、<cert>は考査員認定の有無（true/false）です。"
    )
    print(
        "edit <id> <name> <cert> - 既存の技能章を編集します。<id>は技能章のID、<name>は技能章の名前、<cert>は考査員認定の有無（true/false）です。"
    )
    print("detail <command | help> - 細目ファイルの管理コマンド")
    print("help - このヘルプメッセージを表示します")


def list(filter=None):
    db = load()
    if not db:
        print("No records found.")
    else:
        for record in db:
            if filter and not record["id"].endswith(filter):
                continue
            print(
                f"ID: {record['id']}, 技能章の名前: {record['name']}, 考査員認定: {record['cert']}, 解説URL: {record['url']}"
            )


# addもこれ
def edit(id, name, cert, url):
    db = load()
    for i, record in enumerate(db):
        if record["id"] == id:
            db[i] = {"id": id, "name": name, "cert": cert, "url": url}
            break
    save(db)


def changeId(id, newid):
    db = load()
    for i, record in enumerate(db):
        if record["id"] == id:
            db[i]["id"] = newid
            break
    save(db)


def gino():
    # コマンド入力待ち
    while True:
        command = input("(技能章)Enter command: ").split(" ")
        if command[0] == "list":
            if len(command) == 1 or command[1] == "all":
                list()
            else:
                list(command[1])
        elif command[0] == "edit" or command[0] == "add":
            if len(command) == 5:
                edit(command[1], command[2], command[3], command[4])
            else:
                print("Usage: edit <id> <name> <cert> <url>")
        elif command[0] == "detail":
            if len(command) > 1:
                detail(command)
            else:
                print("Usage: detail <command>")
        elif command[0] == "help":
            help()
        elif command[0] == "exit":
            break
        else:
            print("Unknown command")
