<?php

class Item extends FVModel
{
	protected $table = 'item';
    protected $guarded = array('updated_at', 'created_at');

	public function document()
    {
        return $this->belongsTo('Document');
    }

    public function setPriceAttribute($value) 
    {
        $this->attributes['price'] = (float)str_replace(',', '.', $value);
    }

    public function setVatValueAttribute($value) 
    {
        $this->attributes['vat_value'] = (float)str_replace(',', '.', $value);
    }

    public function setNettoAttribute($value) 
    {
        $this->attributes['netto'] = (float)str_replace(',', '.', $value);
    }

    public function setBruttoAttribute($value) 
    {
        $this->attributes['brutto'] = (float)str_replace(',', '.', $value);
    }
}