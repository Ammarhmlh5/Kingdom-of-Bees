import psycopg2
try:
    conn = psycopg2.connect(
        dbname='project2', user='project2_user', password='Proj2#Pass2025', host='127.0.0.1', port=55433
    )
    print('تم الاتصال بقاعدة بيانات Postgres بنجاح')
    conn.close()
except Exception as e:
    print('فشل الاتصال بقاعدة بيانات Postgres:', e)
