import psycopg2
import os

SQL_FILE = r"d:/Kingdom-of-Bees/packages/db/create-all-tables-safe.sql"

conn = psycopg2.connect(
    dbname='project2', user='project2_user', password='Proj2#Pass2025', host='localhost', port=55433
)
cur = conn.cursor()

with open(SQL_FILE, encoding='utf-8') as f:
    sql = f.read()

# تقسيم الأوامر على أساس الفاصلة المنقوطة مع تجاهل التعليقات
commands = [cmd.strip() for cmd in sql.split(';') if cmd.strip() and not cmd.strip().startswith('--')]
for cmd in commands:
    try:
        cur.execute(cmd)
    except Exception as e:
        print(f'خطأ في تنفيذ الأمر:\n{cmd}\nالسبب: {e}')

conn.commit()
cur.close()
conn.close()
print('تم تجهيز جميع الجداول بنجاح على قاعدة البيانات.')
