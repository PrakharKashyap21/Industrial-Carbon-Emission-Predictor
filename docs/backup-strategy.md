# PostgreSQL Database Backup & Restore Strategy

## 1. Overview
This document specifies the database backup, retention policy, and restore verification procedure for the **Industrial Carbon Emission Prediction System** database (`industrial_carbon_db`).

---

## 2. Backup Execution Command
Daily scheduled backup script using `pg_dump`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/industrial_carbon"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="carbon_db_backup_${TIMESTAMP}.sql.gz"

mkdir -p ${BACKUP_DIR}

# Execute pg_dump inside postgres container
docker exec -t carbon_postgres pg_dump -U postgres -d industrial_carbon_db | gzip > ${BACKUP_DIR}/${FILENAME}

# Retain backups for 30 days
find ${BACKUP_DIR} -type f -name "*.sql.gz" -mtime +30 -delete
```

---

## 3. Restore Verification Procedure
To test backup restoration on a staging or test container:

```bash
# 1. Decompress backup file
gunzip -k /var/backups/industrial_carbon/carbon_db_backup_TIMESTAMP.sql.gz

# 2. Restore into target database
cat /var/backups/industrial_carbon/carbon_db_backup_TIMESTAMP.sql | docker exec -i carbon_postgres psql -U postgres -d industrial_carbon_db

# 3. Verify record counts
docker exec -it carbon_postgres psql -U postgres -d industrial_carbon_db -c "SELECT count(*) FROM predictions; SELECT count(*) FROM reports;"
```
