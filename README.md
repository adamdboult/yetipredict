# Private copy

Copy "private/" folder to yetipredict/ folder

# Docker instructions

```bash
sudo docker-compose build --no-cache
sudo docker-compose up --detach
```

# Viewing the databases

```bash
mongo
show dbs
use yetipredict
show collections
db.<collection name>.find()
```

# Migrating databases

First dump from existing database.

```bash
mongodump
```

Copy the dump to the new server.

Identify container name.

```bash
sudo docker container ls
```

Copy the contents of the dump to the container.

```bash
sudo docker cp dump/ yetipredict_mongo:/home
```

Restore in the container.

```bash
sudo docker exec -it yetipredict_mongo /bin/bash
mongorestore --port 27123 dump/
```
