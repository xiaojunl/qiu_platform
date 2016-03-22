#!/bin/bash

###
# This script updates the local repo with the latest changes from Github.
#
# The master branch will be REPLACED with what's in Github and all local changes
# will be LOST.
###
cd `dirname $0`
git pull
cd wechat
bower install --allow-root
rm -rf /srv/sources/wechat
mkdir /srv/sources/wechat
cd ../
cp -r wechat/app/* /srv/sources/wechat/
cd weixin
bower install --allow-root
rm -rf /srv/sources/weixin
mkdir /srv/sources/weixin
cd ../
cp -r weixin/app/* /srv/sources/weixin/
rm -rf /srv/sources/api
mkdir /srv/sources/api
cp -r docs /srv/sources/api/
rm -rf /srv/sources/admin
mkdir /srv/sources/admin
cd admin
bower install --allow-root
cp -r app/* /srv/sources/admin/
cd ../api
npm install --production
cd ../sched
npm install --production
NODE_ENV=prelease pm2 restart api_test
NODE_ENV=prelease pm2 restart sched_test
