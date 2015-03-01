<?php

/**
* 
*/
class Auth extends \Slim\Middleware
{
    protected $realm = "Basi faktury";
    protected $req;
    protected $res;

    public function call()
    {
        if (empty($_SESSION['user'])){
            $this->req = $this->app->request();
            $this->res = $this->app->response();

            $authUser = $this->req->headers('PHP_AUTH_USER');
            $authPass = $this->req->headers('PHP_AUTH_PW');

            if ($authUser && $authPass) {
                $user = new \User();
                if ($logged = $user->login($authUser, $authPass)) {
                    $_SESSION['user'] = $logged;
                    $this->next->call();
                    
                } else {
                    unset($_SESSION['user']);
                    $this->errorResponse();
                }

            } else {
                $this->errorResponse();
            }

        } else {
            $this->next->call();
        }
    }

    private function errorResponse() 
    {
        $this->res->status(401);
        $this->res->header('WWW-Authenticate', sprintf('Basic realm="%s"', $this->realm));
    }
}