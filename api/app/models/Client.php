<?php

class Client extends FVModel
{
	protected $table = 'client';
    protected $guarded = array('country', 'updated_at', 'created_at');

	public function documents()
	{
		return $this->hasMany('Document');
	}
}