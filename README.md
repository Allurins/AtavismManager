# AtavismEditor

AtavismManager (AtavismEditor) — настольный редактор на Electron + Angular для управления данными и конфигурацией сервера Atavism MMO.

Проект собран на последних версиях [Electron](https://www.electronjs.org/docs/tutorial/development-environment) и [Angular](https://angular.io/guide/setup-local).

Требуются NodeJs@12 и npm@6.4.

## Development server

Чтобы установить зависимости, запустите `yarn`.

Чтобы запустить приложение локально, выполните `yarn start`.

Локальный запуск работает как браузерное приложение, без нативных возможностей Electron.

Чтобы запустить приложение в нативном режиме Windows, выполните `yarn electron:local`. Минус — нет live‑reload.

# Important thing about branches
В ветке master находится актуальная версия приложения. Сейчас это версия `10.2.0`.

Предыдущая версия находится в ветке `production/v10.1.0`.

Важно: не обновляйте production‑ветку из master.

## Update changes

Мы используем [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). На их основе формируется CHANGELOG.md.

Названия веток тоже должны соответствовать conventional commits.

Чтобы обновить версию приложения, вручную выполните одну из команд:
 - Patch: `yarn version`

## Build application release

Чтобы собрать релиз для каждой ОС:
 - Mac OS: `yarn mac:build`
 - Linux OS: `yarn linux:build`
 - Windows OS: `yarn win:build`
 
Сборка находится в папке `release`.

Важно запускать команды выше, так как они готовят, копируют и обновляют версии пакета приложения.
