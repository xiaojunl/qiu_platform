#!/bin/bash

###
# This script updates the local repo with the latest changes from Github.
#
# The master branch will be REPLACED with what's in Github and all local changes
# will be LOST.
###
cd `dirname $0`
cd wechat
bower install --allow-root
rm -rf /srv/sources/release/wechat
mkdir -p /srv/sources/release/wechat
cd ../
cp -r wechat/app/* /srv/sources/release/wechat/
cp -r site/* /srv/sources/release/
rm -rf /srv/sources/release/admin
mkdir /srv/sources/release/admin
cd admin
bower install --allow-root
cp -r app/* /srv/sources/release/admin/
cd ../api
npm install --production
cd ../sched
npm install --production
pm2 restart api
pm2 restart sched
