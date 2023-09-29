#!/usr/bin/env bash

# остановить публикацию при ошибках
 set -e

# сборка приложения
npm run build

# переход в каталог сборки
cd dist

# инициализация репозитория и загрузка кода на GitHub
git init

git add .

git commit -m "deploy"

git push -f https://github.com/Spektra135/Elevator-simulation.git master:gh-pages

cd -



