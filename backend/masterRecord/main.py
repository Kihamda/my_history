import gino, grade, build

while True:
    mode = input("Enter mode (1: 技能章, 2: 進級章, 3: ビルド, 4: 終了): ")
    if mode == "1":
        gino.gino()
    elif mode == "2":
        grade.grade()
    elif mode == "3":
        build.build()
    elif mode == "4":
        print("終了します。")
        break
