-- This is an empty migration.

SELECT path, REGEXP_REPLACE(CONCAT(path, '/'), '\/[0-9]*\/', ':id/') FROM "Webhook";