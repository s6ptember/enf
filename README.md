# 🛍 ERD - Интернет-магазин одежды (Django + HTMX + Alpine.js)

## 🌟 Особенности проекта
- **Современный стек**: Django + HTMX + Alpine.js
- **Две платежные системы**: Stripe и Heleket (крипто)
- **Docker-контейнеризация** с PostgreSQL
- **Кастомизированная модель пользователя**
- **Защищенные настройки** (CSRF, HTTPS, Security Headers)

## 🚀 Запуск проекта

### 1. Локальный запуск (без Docker)

1. Установите зависимости:
```bash
python -m pip install -r requirements.txt
```

2. Создайте и активируйте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate    # Windows
```

3. Настройте переменные окружения:
```
# Заполните .env своими значениями(пример .env ниже)
```

4. Запустите миграции:
```bash
python manage.py migrate
```

5. Создайте суперпользователя:
```bash
python manage.py createsuperuser
```

6. Запустите сервер:
```bash
python manage.py runserver
```

### 2. Запуск на сервере (с SSL)

1. Подготовьте домен:
   - Укажите DNS запись для `domen.com` на ваш IP

2. Настройте `.env`:
```ini
SECRET_KEY='example'

POSTGRES_DB=enfdb
POSTGRES_USER=enfdb
POSTGRES_PASSWORD=enfdb
POSTGRES_HOST=localhost # db если запускаете на vps
POSTGRES_PORT=5432

STRIPE_SECRET_KEY='example'
STRIPE_WEBHOOK_SECRET='example'

HELEKET_API_KEY='example'
HELEKET_SECRET_KEY='example'
```

3. Получите сертификаты (certbot):
```bash
sudo certbot --nginx -d domen.com -d www.domen.com
```

4. Соберите контейнер:
```bash
docker-compose up --build -d
```

5. Соберите статику:
```bash
docker-compose exec web python manage.py collectstatic --no-input
```

## 🔒 Настройки безопасности
Проект предварительно настроен с:
- CSRF защитой
- Secure cookies
- Security Headers
- HTTPS при работе через Docker

## 🌍 Доступ к сайту
- Локально: [http://localhost:8000](http://localhost:8000)
- В Docker с SSL: [https://domen.com](https://domen.com)

## ⚙️ Важные настройки из settings.py
```python
# Безопасность
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True

# База данных
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB'),
        # ... другие параметры
    }
}

# Платежные системы
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
HELEKET_API_KEY = os.getenv('HELEKET_API_KEY')
```

## 🛠 Гайд на деплой
[https://github.com/s6ptember/for-deploy-guide.git]
