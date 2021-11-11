# Shared Api Clients

## Как пошарить API клиенты и не сойти с ума

#### Стратегия:

- В репозиторий, генерирующий swagger размещаем триггер для генерации / публикации апи клиента
- Репозиторий, отвечающий за апи клиенты получает swagger файл
- Собирает из него npm пакет
- Поднимает его версию
- Публикует его в npm registry

#### Как использовать данный репозиторий:

Вы используете Gitlab:

1. Разместить содержимое репозитория у себя в гитлабе
2. В `api/` добавить необходимое количество апи клиентов (можно копипастить `api-client`)
3. Для добавленных клиентов изменить:

```
package.json
  "name": указать свое название
  "peerDependencies": заменить на свой пакет с базовыми http клиентами

templates/
   *: изменить на свои шаблоны при необходимости (базовые шаблоны находятся в shared/src/templates

ci.yml
   заменить значения переменных на свои

.npmrc
   "registry" - указать url своего npm registry
```

4. В `.gitlab-ci.yml` добавить для каждого апи клиента:

```yaml
include:
  - local: "api/${YOUR_API_CLIENT}/ci.yml"
```

5. В репозитории бэкенда, где генерируем `swagger` описание добавить:

```yaml
build_frontend_client:
  stage: build
  allow_failure: true
  variables:
    SERVICE: ${YOUR_API_CLIENT}
    SERVICE_REF_SLUG: ${CI_COMMIT_REF_SLUG}
  trigger:
    project: ${YOUR_PROJECT_FOR_API_CLIENT}
    branch: "master"
  only:
    changes:
      - ${PATH_TO_SWAGGER_FILE}
```

где:

```yaml
${YOUR_PROJECT_FOR_API_CLIENT} - название репозитория из п.1
${PATH_TO_SWAGGER_FILE} - путь до swagger файла в репозитории бэкенда
```

Вы используете что-то другое:  
PR welcome!)

#### Как потестировать локально:

1. Собрать `shared` пакет:

```shell
# выполнить в shared
npm i
npm run build
```

2. Сгенерировать апи клиент из примера:

```shell
# выполнить в api/api-client
npm i
npm run build:test
```

Результат сборки апи клиента будет доступен в `api/api-client/dist`
