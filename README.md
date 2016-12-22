# Allspark


## Usage

* Download this [repo](https://github.com/iamblue/allspark/archive/master.zip)
* Unzip this file and copy this folder path.
* Open your chrome browser
* Input `chrome://extensions` into the url.
* Click `Load unpacked extension ...` button, and choose the `{folder path}/app/build` path.
* You will see a `Allspark` application.
* For Windows User:
  * Go into the `{folder path}/host`, and click register.bat.
* For Mac/Linux User:
  * Open your command line, and go into `{folder path}/host`
  * Edit `com.my_company.my_application.json`, change the "path" content to your `{folder path}/host/my_host.js`.
  * exec `./register.sh`
* Go back chrome extension page, and open the `Allspark` app~


## For Dev

### Env
* Only support Nodejs version >= 6

### Setup
* git clone https://github.com/iamblue/allspark.git
* cd allspark
* npm i

### Build
* npm run build:global
* go to your chrome extension page, and refresh the app.
