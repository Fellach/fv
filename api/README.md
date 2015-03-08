# Fv API

Created with [Slim framework](http://slimframework.com) combined with Laravel's [Eloquent](http://laravel.com/docs/master/eloquent) ORM.

***

## Quick Start

To start using API is neccessary to create model and install vendors with composer command:
> php ./composer.phar install

Model can be found in *install.sql*. Please create a database and the run this script. After that rename *api/app/passwords-sample.php* to *passwords.php* and fill the sections with proper values.

Your domain should point to *api/app/public/* folder, which contains assets also. 


## Description

PDF class uses MyPDF library. Generated PDF goes to */docs* folder. Mail class uses Swift Mailer. Auth class benefits basic HTTP authentication mechanism, extended with session. In *api/app/view* folder you can find **index.html** contains angular basic structure, and **template.pdf** used by PDF class as, never guest, template.