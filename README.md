# Ticket System — Spring Boot + React

Приложение собрано как один исполняемый JAR: Spring MVC/Hibernate обслуживают REST API, а собранный React находится внутри JAR. На сервере `npm` не нужен.

## Локальная сборка

Нужны JDK 17+, Node.js/npm (только для сборки) и PostgreSQL. По умолчанию используется `jdbc:postgresql://localhost:5432/lab_db`, пользователь и пароль `ldpst`. Схема `variant2`, ограничения и функции PostgreSQL создаются Flyway.

```powershell
.\gradlew.bat clean bootJar
java -jar .\build\libs\is-lab-1.jar
```

Сайт: `http://localhost:8080/is-lab-1/`.

Для разработки фронтенда запустите `npm run dev` в `frontend`; Vite проксирует API и WebSocket на Spring Boot.

## Развёртывание без npm

Соберите JAR локально, загрузите на сервер только `build/libs/is-lab-1.jar` и запустите:

```bash
DB_URL='jdbc:postgresql://pg:5432/studs' \
DB_USERNAME='sXXXXXX' \
DB_PASSWORD='секрет' \
java -jar is-lab-1.jar --server.port=8080
```

Фоновый запуск без systemd:

```bash
nohup env DB_URL='jdbc:postgresql://pg:5432/studs' DB_USERNAME='sXXXXXX' DB_PASSWORD='секрет' \
  java -jar is-lab-1.jar --server.port=8080 > ticket-system.log 2>&1 &
```

Если на сервере несколько приложений, выберите свободный порт через `--server.port`. WildFly, Docker и npm для запуска не требуются.

## Архитектура

- `domain` — JPA-сущности и перечисления;
- `application` — сценарии, транзакции и порты хранилищ;
- `persistence` — Spring Data JPA и вызовы функций PostgreSQL;
- `api` — REST DTO, контроллеры, ошибки и WebSocket;
- `frontend/src` — React-компоненты, страницы и клиент API.

Специальные операции реализованы функциями в `src/main/resources/db/migration/V1__variant2_schema.sql` и вызываются из бизнес-слоя через persistence-адаптер.
