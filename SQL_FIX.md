# Fix Masalah SQL - Migration Final

## Masalah
Syntax error: `ON CONFLICT` dengan `RETURN QUERY` - pattern ini tidak valid di PostgreSQL

## Solusi
Saya buat migration baru yang menggunakan pattern yang benar:
- Cek `NOT FOUND` dulu
- Lalu `INSERT` atau `UPDATE` terpisah

## File Baru
**migrations/006_user_streaks_final.sql**

Ini menggunakan:
- `random()`, `md5()`, `uuid_generate_v4()` - fungsi standar PostgreSQL
- `jsonb_set()` - untuk manipulasi array JSON
- Logic yang lebih sederhana dan aman

## Langkah Jalankan

1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Jalankan file ini:
   ```
   migrations/006_user_streaks_final.sql
   ```
4. Refresh browser
5. Buka Dashboard
6. Add job baru
7. Cek apakah streak bertambah

## Debugging

Jika masih ada error:
1. Cek di Supabase → Table Editor:
   - Apakah tabel `user_streaks` ada?
   - Apakah ada data di dalamnya?
2. Cek di Supabase → SQL Editor:
   - Jalankan query ini:
   ```sql
   SELECT * FROM user_streaks WHERE user_id = 'I3ExR752hpbPljCHHiukl1eayI72';
   ```
