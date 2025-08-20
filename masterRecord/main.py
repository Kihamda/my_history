import gino

while True:
    print("Hello, World!")
    mode = input("Enter mode (1: 技能章, 2: 進級章, 3: 終了): ")
    if mode == "1":
        gino.gino()
    elif mode == "2":
        print("進級章 selected")
    elif mode == "3":
        print("終了します。")
        break
