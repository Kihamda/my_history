from gino import load
from ginoDetail import save, detailLoadFromURL

db = load()

for record in db:
    id = record["id"]
    detailLoadFromURL(id)
