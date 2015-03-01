<?php

use \Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $table = 'user';
    protected $guarded = array('password', 'updated_at', 'created_at');

    public function login ($user, $passphrase) 
    {
        $password = $this->encrypt($passphrase);
        $user = $this->where('name', 'LIKE', $user)->where('password', 'LIKE', $password)->first();

        return $user;
    }

    public function setPasswordAttribute ($passphrase)
    {
        $this->attributes['password'] = $this->encrypt($passphrase);
    }

    private function encrypt ($value)
    {
        global $config;
        return base64_encode(\Slim\Http\Util::encrypt($value, $config['secret'], md5($config['secret'])));
    }


}