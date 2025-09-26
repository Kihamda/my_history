from grade import load
from setting import path

db = load()
counter = 0
tmp = []

with open(path + "/data/gradeDetail/dt.csv", "r", encoding="utf-8") as file:
    data = [s.rstrip() for s in file.readlines()]
    loopcount = 0
    trop = []
    for line in data:
        parts = line.split(",")
        if parts[0] == "":
            counter += 1
            loopcount = 0
            tmp.append(list(trop))
            trop.clear()
            continue
        else:
            cert = "false"
            if parts[3] == "TRUE":
                cert = "true"
            trop.append(f"{loopcount},{parts[1]},{parts[2]},{cert}")
            loopcount += 1

for i in range(counter):
    with open(
        path + f"/data/gradeDetail/{db[i]['id']}.csv", "w", encoding="utf-8"
    ) as file:
        for line in tmp[i]:
            file.write(f"{line}\n")
