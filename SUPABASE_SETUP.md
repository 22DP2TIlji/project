# Настройка Supabase для загрузки изображений

## 1. Создание Storage Bucket

1. Откройте ваш Supabase Dashboard
2. Перейдите в раздел **Storage**
3. Нажмите **"New bucket"** или **"Create bucket"**
4. Заполните:
   - **Name:** `destination-images`
   - **Public bucket:** ✅ Включите (или настройте политики вручную)
5. Нажмите **"Create bucket"**

## 2. Настройка политик доступа (если bucket не публичный)

Если вы не сделали bucket публичным, нужно добавить политики:

### Политика для загрузки (INSERT):
```sql
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'destination-images');
```

### Политика для чтения (SELECT):
```sql
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'destination-images');
```

## 3. Проверка колонки в базе данных

Убедитесь, что в таблице `destinations` есть колонка:
- **Название:** `image_url`
- **Тип:** `text`
- **Nullable:** ✅ Да (может быть NULL)

## 4. Проверка переменных окружения

В файле `.env.local` должны быть:
```
NEXT_PUBLIC_SUPABASE_URL=ваш_url_из_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_key_из_supabase
```

## 5. Перезапуск сервера

После всех изменений:
```bash
npm run dev
```

## Отладка

Если загрузка не работает:
1. Откройте консоль браузера (F12)
2. Попробуйте загрузить изображение
3. Посмотрите на ошибки в консоли
4. Проверьте Network tab - какой запрос падает?

