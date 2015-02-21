<?php

/**
* 
*/
class Auth extends \Slim\Middleware
{
    protected $realm = "Basi faktury";
    protected $username;
    protected $password;

    public function __construct($config)
    {
        $this->username = $config['user'];
        $this->password = $config['pass'];
    }

    public function call()
    {
        $req = $this->app->request();
        $res = $this->app->response();

        $authUser = $req->headers('PHP_AUTH_USER');
        $authPass = $req->headers('PHP_AUTH_PW');

        if ($authUser && $authPass && $authUser === $this->username && $authPass === $this->password) {
            $this->next->call();
        } else {
            $res->status(401);
            $res->header('WWW-Authenticate', sprintf('Basic realm="%s"', $this->realm));
        }
    }
}