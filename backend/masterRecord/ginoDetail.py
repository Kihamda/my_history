from setting import path, bsurl
import os
import requests
import re
from html.parser import HTMLParser


# GPT-5 made this. DONT ASK ME
class _NewChallengeListParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_target_container = False
        self.container_div_depth = 0
        self.capturing_ol = False
        self.ol_depth = 0
        self.target_ol_depth = None
        self.in_li = False
        self.current_li = []
        self.items = []

    def handle_starttag(self, tag, attrs):
        if tag == "div":
            cls = None
            for k, v in attrs:
                if k == "class":
                    cls = v
                    break
            if cls and "new-challenge-paragraph" in cls.split():
                self.in_target_container = True
            if self.in_target_container:
                self.container_div_depth += 1

        if self.in_target_container and tag == "ol":
            self.ol_depth += 1
            if self.target_ol_depth is None:
                self.target_ol_depth = self.ol_depth
                self.capturing_ol = True
        elif tag == "ol":
            self.ol_depth += 1

        if self.capturing_ol and tag == "li" and self.ol_depth == self.target_ol_depth:
            self.in_li = True
            self.current_li = []

        if tag == "br" and self.in_li:
            self.current_li.append("\n")

    def handle_endtag(self, tag):
        if tag == "li" and self.in_li:
            raw = "".join(self.current_li)
            # 全角はそのまま 半角空白の連続を1つ
            text = re.sub(r"[ \t\r\f\v]+", " ", raw)
            # 行ごとに strip して結合
            lines = [ln.strip() for ln in text.strip().splitlines()]
            text = "\n".join([ln for ln in lines if ln])
            if text:
                self.items.append(text)
            self.in_li = False
            self.current_li = []

        if tag == "ol":
            if self.ol_depth == self.target_ol_depth and self.capturing_ol:
                self.capturing_ol = False
            self.ol_depth -= 1

        if tag == "div" and self.in_target_container:
            self.container_div_depth -= 1
            if self.container_div_depth == 0:
                self.in_target_container = False

    def handle_data(self, data):
        if self.in_li:
            self.current_li.append(data)


def load(id):
    db = []
    with open(
        path + "data/ginoshoDetail/" + id + ".csv", "r", encoding="utf-8"
    ) as file:
        data = [s.rstrip() for s in file.readlines()]
        for line in data:
            parts = line.split(",")
            db.append(
                {
                    "sort": int(parts[0]),
                    "number": parts[1],
                    "description": parts[2].replace(
                        "[[enter]]",
                        "\n",
                    ),
                }
            )
    return db


def save(id, db):
    with open(
        path + "data/ginoshoDetail/" + id + ".csv", "w", encoding="utf-8"
    ) as file:
        for record in db:
            note = record["description"].replace("\n", "[[enter]]")
            file.write(f"{record['sort']},{record['number']},{note}\n")


def parse_new_challenge_list(html: str) -> list[str]:
    """
    .new-challenge-paragraph 内で最初に出現する ol の直下 li テキストを配列で返す
    """
    if not html:
        return []
    p = _NewChallengeListParser()
    p.feed(html)
    p.close()
    return p.items


def detail(command):
    if command[1] == "check" or command[1] == "chk":
        check()
    elif command[1] == "url":
        if len(command) > 2:
            detailLoadFromURL(command[2])
        else:
            print("Usage: detail url <技能章ID>")
    elif command[1] == "list":
        if len(command) > 2:
            list(command[2])
        else:
            print("Usage: detail list <技能章ID>")


def check():
    exceptFiles = []
    with open(path + "data/ginosho.csv", "r", encoding="utf-8") as file:
        data = [s.rstrip() for s in file.readlines()]
        for line in data:
            parts = line.split(",")
            exceptFiles.append(parts[0] + ".csv")

    realFiles = [
        f
        for f in os.listdir(path + "data/ginoshoDetail")
        if os.path.isfile(os.path.join(path + "data/ginoshoDetail", f))
    ]

    for file in realFiles:
        if file not in exceptFiles:
            print(f"対応する技能章記録が見つからない: {file}")
        else:
            realFiles.remove(file)

    for file in exceptFiles:
        print(f"対応する細目ファイルが見つからない: {file}")


def detailLoadFromURL(id):
    url = bsurl + id
    db = []
    if url:
        data = requests.get(url)
        soup = parse_new_challenge_list(data.text)
        for i, t in enumerate(soup, 1):
            db.append({"sort": i, "number": i, "description": t})

        save(id, db)
    else:
        print(f"Record not found for ID: {id}")


def list(id):
    try:
        db = load(id)
    except FileNotFoundError:
        print(f"File not found: {id}")
        return
    if not db:
        print("No records found.")
    else:
        for record in db:
            print(
                f"見かけの番号: {record['sort']}, 実際の番号: {record['number']}, 説明: {record['description']}"
            )
