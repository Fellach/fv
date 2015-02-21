<?php

use \Illuminate\Database\Eloquent\Model;

class Item extends Model
{
	protected $table = 'item';
    protected $guarded = array('updated_at', 'created_at');

	public function document()
    {
        return $this->belongsTo('Document');
    }
}